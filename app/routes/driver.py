from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory
from app.db import get_db
import os

bp = Blueprint('driver', __name__, url_prefix='/driver')

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        employee_id = request.form.get('employee_id')
        db = get_db()
        employee = db.execute("SELECT * FROM employees WHERE employee_id = ?", (employee_id,)).fetchone()
        
        if employee and 'driver' in (employee['job_title'] or '').lower():
            session['driver_id'] = employee['employee_id']
            session['driver_name'] = f"{employee['first_name']} {employee['last_name']}"
            return redirect(url_for('driver.dashboard'))
        else:
            flash('Invalid ID or not a driver', 'error')
            
    return render_template('driver/login.html')

@bp.route('/dashboard')
def dashboard():
    if 'driver_id' not in session:
        return redirect(url_for('driver.login'))
        
    db = get_db()
    # Get pending deliveries
    pending_orders = db.execute("""
        SELECT o.*, u.name as customer_name, u.address as delivery_address, u.phone as customer_phone
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        WHERE o.status = 'out_for_delivery'
    """).fetchall()
    
    return render_template('driver/dashboard.html', pending_orders=pending_orders)

@bp.route('/route-optimizer')
def route_optimizer():
    if 'driver_id' not in session:
        return redirect(url_for('driver.login'))
    # Serve the React app container
    return render_template('driver/route_optimizer.html')

# API for Route Optimizer
@bp.route('/api/deliveries/pending')
def api_pending_deliveries():
    if 'driver_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    db = get_db()
    pending_orders = db.execute("""
        SELECT o.order_id, u.name, u.address, u.phone, o.total
        FROM orders o
        JOIN users u ON o.user_id = u.user_id
        WHERE o.status = 'out_for_delivery'
    """).fetchall()
    
    stops = []
    for order in pending_orders:
        stops.append({
            'id': order['order_id'],
            'name': order['name'],
            'address': order['address'],
            'phone': order['phone'],
            'total': order['total']
        })
        
    return jsonify({'stops': stops})
