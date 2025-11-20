from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from app.db import get_db
from datetime import datetime

bp = Blueprint('worker', __name__, url_prefix='/worker')

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        employee_id = request.form.get('employee_id')
        db = get_db()
        employee = db.execute("SELECT * FROM employees WHERE employee_id = ?", (employee_id,)).fetchone()
        
        if employee and employee['status'] == 'active':
            session['worker_id'] = employee['employee_id']
            session['worker_name'] = f"{employee['first_name']} {employee['last_name']}"
            return redirect(url_for('worker.dashboard'))
        else:
            flash('Invalid ID or inactive account', 'error')
            
    return render_template('worker/login.html')

@bp.route('/dashboard')
def dashboard():
    if 'worker_id' not in session:
        return redirect(url_for('worker.login'))
        
    db = get_db()
    employee = db.execute("SELECT * FROM employees WHERE employee_id = ?", (session['worker_id'],)).fetchone()
    
    today = datetime.now().strftime('%Y-%m-%d')
    attendance = db.execute(
        "SELECT * FROM attendance WHERE employee_id = ? AND date = ?", 
        (session['worker_id'], today)
    ).fetchone()
    
    return render_template('worker/dashboard.html', employee=employee, attendance=attendance)

@bp.route('/checkin', methods=['POST'])
def checkin():
    if 'worker_id' not in session:
        return redirect(url_for('worker.login'))
        
    db = get_db()
    today = datetime.now().strftime('%Y-%m-%d')
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    try:
        db.execute(
            "INSERT INTO attendance (employee_id, date, check_in_time) VALUES (?, ?, ?)",
            (session['worker_id'], today, now)
        )
        db.commit()
        flash('Checked in!', 'success')
    except db.IntegrityError:
        flash('Already checked in', 'info')
        
    return redirect(url_for('worker.dashboard'))

@bp.route('/checkout', methods=['POST'])
def checkout():
    if 'worker_id' not in session:
        return redirect(url_for('worker.login'))
        
    db = get_db()
    today = datetime.now().strftime('%Y-%m-%d')
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    # Calculate hours
    attendance = db.execute(
        "SELECT check_in_time FROM attendance WHERE employee_id = ? AND date = ?",
        (session['worker_id'], today)
    ).fetchone()
    
    if attendance and attendance['check_in_time']:
        check_in = datetime.strptime(attendance['check_in_time'], '%Y-%m-%d %H:%M:%S')
        check_out = datetime.strptime(now, '%Y-%m-%d %H:%M:%S')
        hours = (check_out - check_in).total_seconds() / 3600
        
        db.execute(
            "UPDATE attendance SET check_out_time = ?, hours_worked = ? WHERE employee_id = ? AND date = ?",
            (now, hours, session['worker_id'], today)
        )
        db.commit()
        flash(f'Checked out. Hours: {hours:.2f}', 'success')
    else:
        flash('Not checked in', 'error')
        
    return redirect(url_for('worker.dashboard'))

@bp.route('/logout')
def logout():
    session.pop('worker_id', None)
    session.pop('worker_name', None)
    return redirect(url_for('worker.login'))
