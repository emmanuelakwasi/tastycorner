from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from app.db import get_db
import json
from datetime import datetime

bp = Blueprint('admin', __name__, url_prefix='/admin')

def is_admin():
    return session.get('is_admin') is True

@bp.before_request
def restrict_access():
    if request.endpoint != 'admin.login' and not is_admin():
        return redirect(url_for('admin.login'))

@bp.route('/', methods=['GET', 'POST'])
def index():
    # Redirect to login if not admin (handled by before_request, but index is special)
    if not is_admin():
        return redirect(url_for('admin.login'))
        
    db = get_db()
    
    # --- Dashboard Stats (Optimized SQL) ---
    
    # 1. Overview Stats
    stats = db.execute("""
        SELECT 
            COUNT(*) as total_orders,
            SUM(total) as total_revenue,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_orders,
            AVG(total) as avg_order_value,
            AVG(tip) as avg_tip
        FROM orders
    """).fetchone()
    
    total_orders = stats['total_orders'] or 0
    total_revenue = stats['total_revenue'] or 0
    pending_orders = stats['pending_orders'] or 0
    completed_orders = stats['completed_orders'] or 0
    avg_order_value = stats['avg_order_value'] or 0
    avg_tip = stats['avg_tip'] or 0
    
    # 2. Sales Chart (Daily)
    sales_data = db.execute("""
        SELECT date(created_at) as day, SUM(total) as daily_total 
        FROM orders 
        GROUP BY day 
        ORDER BY day ASC
    """).fetchall()
    sales_labels = [row['day'] for row in sales_data]
    sales_values = [row['daily_total'] for row in sales_data]
    
    # 3. Top Items
    top_items = db.execute("""
        SELECT name, SUM(quantity) as total_qty 
        FROM order_items 
        GROUP BY name 
        ORDER BY total_qty DESC 
        LIMIT 7
    """).fetchall()
    most_labels = [row['name'] for row in top_items]
    most_values = [row['total_qty'] for row in top_items]
    
    # 4. Recent Activity
    recent_activity = db.execute("""
        SELECT o.order_id, o.created_at, o.total, o.status, u.name as customer
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        ORDER BY o.created_at DESC
        LIMIT 12
    """).fetchall()
    
    # 5. Employees
    employees = db.execute("SELECT * FROM employees ORDER BY created_at DESC").fetchall()
    
    # 6. Menu Items
    menu_items = db.execute("SELECT * FROM menu_items").fetchall()
    categories = db.execute("SELECT DISTINCT category FROM menu_items").fetchall()
    all_categories = [c['category'] for c in categories]

    return render_template('admin/dashboard.html',
        total_orders=total_orders,
        total_revenue=total_revenue,
        pending_orders=pending_orders,
        completed_orders=completed_orders,
        average_order_value=avg_order_value,
        average_tip=avg_tip,
        sales_chart=json.dumps({'labels': sales_labels, 'values': sales_values}),
        top_items_chart=json.dumps({'labels': most_labels, 'values': most_values}),
        recent_activity=recent_activity,
        employees=employees,
        menu_items=menu_items,
        all_categories=all_categories,
        admin_email=session.get('admin_email'),
        # Pass other required variables for template compatibility
        weekly_chart=json.dumps({'labels': [], 'values': []}), # Placeholder
        monthly_chart=json.dumps({'labels': [], 'values': []}), # Placeholder
        customer_chart=json.dumps({'labels': [], 'values': []}), # Placeholder
        status_chart=json.dumps({'labels': [], 'values': []}), # Placeholder
        category_chart=json.dumps({'labels': [], 'values': []}), # Placeholder
        initial_section=request.args.get('section', 'overview')
    )

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        if email == current_app.config['ADMIN_EMAIL'] and password == current_app.config['ADMIN_PASSWORD']:
            session['is_admin'] = True
            session['admin_email'] = email
            flash('Welcome back, Admin!', 'success')
            return redirect(url_for('admin.index'))
        else:
            flash('Invalid credentials', 'error')
    return render_template('admin/login.html')

@bp.route('/logout')
def logout():
    session.pop('is_admin', None)
    session.pop('admin_email', None)
    flash('Admin signed out', 'info')
    return redirect(url_for('admin.login'))

# --- Employee Management Routes ---
@bp.route('/employees/add', methods=['POST'])
def add_employee():
    db = get_db()
    try:
        db.execute("""
            INSERT INTO employees (employee_id, first_name, last_name, email, job_title, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            # Generate ID logic or use form input
            request.form.get('employee_id') or f"{int(datetime.now().timestamp())}", 
            request.form.get('first_name'),
            request.form.get('last_name'),
            request.form.get('email'),
            request.form.get('job_title'),
            'active'
        ))
        db.commit()
        flash('Employee added', 'success')
    except Exception as e:
        flash(f'Error adding employee: {e}', 'error')
    return redirect(url_for('admin.index', section='employees'))

# --- Menu Management Routes ---
@bp.route('/menu/add', methods=['POST'])
def add_menu_item():
    db = get_db()
    try:
        db.execute("""
            INSERT INTO menu_items (name, description, price, category, image)
            VALUES (?, ?, ?, ?, ?)
        """, (
            request.form.get('name'),
            request.form.get('description'),
            request.form.get('price'),
            request.form.get('category'),
            '' # Image handling to be added
        ))
        db.commit()
        flash('Menu item added', 'success')
    except Exception as e:
        flash(f'Error: {e}', 'error')
    return redirect(url_for('admin.index', section='menu'))
