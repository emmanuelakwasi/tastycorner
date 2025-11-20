from flask import Blueprint, render_template, request, redirect, url_for, flash, session, current_app
from app.db import get_db
import json
from datetime import datetime

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    db = get_db()
    # Get featured items (simulated by specific names or random)
    featured_names = ['Classic Burger', 'Margherita Pizza', 'Chicken Wings', 'Chocolate Cake']
    placeholders = ','.join(['?'] * len(featured_names))
    featured_items = db.execute(
        f"SELECT * FROM menu_items WHERE name IN ({placeholders})",
        featured_names
    ).fetchall()
    
    # Sort to maintain order
    featured_items.sort(key=lambda x: featured_names.index(x['name']) if x['name'] in featured_names else 999)
    
    return render_template('index.html', featured_items=featured_items)

@bp.route('/menu')
def menu():
    db = get_db()
    search_query = request.args.get('search', '').lower()
    category_filter = request.args.get('category', '')
    
    query = "SELECT * FROM menu_items WHERE is_active = 1"
    params = []
    
    if search_query:
        query += " AND (lower(name) LIKE ? OR lower(description) LIKE ?)"
        params.extend([f'%{search_query}%', f'%{search_query}%'])
    
    if category_filter:
        query += " AND category = ?"
        params.append(category_filter)
        
    items = db.execute(query, params).fetchall()
    
    # Group by category
    categories = {}
    all_categories = set()
    for item in items:
        category = item['category']
        all_categories.add(category)
        if category not in categories:
            categories[category] = []
        categories[category].append(item)
        
    # Get all categories for filter
    all_cats_query = db.execute("SELECT DISTINCT category FROM menu_items WHERE is_active = 1 ORDER BY category").fetchall()
    all_categories_list = [row['category'] for row in all_cats_query]
    
    # Wishlist
    wishlist_ids = []
    if 'user_id' in session:
        w_items = db.execute("SELECT item_id FROM wishlist WHERE user_id = ?", (session['user_id'],)).fetchall()
        wishlist_ids = [w['item_id'] for w in w_items]
    elif 'wishlist' in session: # Fallback for guest session wishlist if we kept it
        wishlist_ids = [w['item_id'] for w in session['wishlist']]

    return render_template('menu.html', 
                         categories=categories, 
                         all_categories=all_categories_list,
                         search_query=request.args.get('search', ''),
                         category_filter=category_filter,
                         wishlist_ids=wishlist_ids, 
                         user_name=session.get('user_name'))

@bp.route('/cart', methods=['GET', 'POST'])
def cart():
    if 'user_id' not in session:
        flash('Please sign in to view your cart', 'error')
        return redirect(url_for('auth.signin'))
    
    if request.method == 'POST':
        item_id = request.form.get('item_id')
        quantity = int(request.form.get('quantity', 1))
        allergies = request.form.get('allergies', '')
        
        if 'cart' not in session:
            session['cart'] = []
            
        db = get_db()
        item = db.execute("SELECT * FROM menu_items WHERE item_id = ?", (item_id,)).fetchone()
        
        if item:
            cart_item = {
                'item_id': item['item_id'],
                'name': item['name'],
                'price': float(item['price']),
                'quantity': quantity,
                'allergies': allergies
            }
            session['cart'].append(cart_item)
            session.modified = True
            flash(f'{item["name"]} added to cart!', 'success')
            
        return redirect(url_for('main.menu'))

    cart = session.get('cart', [])
    subtotal = sum(item['price'] * item['quantity'] for item in cart)
    return render_template('cart.html', cart=cart, subtotal=subtotal, user_name=session.get('user_name'))

@bp.route('/update_cart_quantity', methods=['POST'])
def update_cart_quantity():
    if 'user_id' not in session:
        return redirect(url_for('auth.signin'))
        
    index = int(request.form.get('index', -1))
    quantity = int(request.form.get('quantity', 1))
    
    if 'cart' in session and 0 <= index < len(session['cart']):
        if quantity <= 0:
            session['cart'].pop(index)
        else:
            session['cart'][index]['quantity'] = quantity
        session.modified = True
        
    return redirect(url_for('main.cart'))

@bp.route('/remove_from_cart/<int:index>')
def remove_from_cart(index):
    if 'cart' in session and 0 <= index < len(session['cart']):
        session['cart'].pop(index)
        session.modified = True
    return redirect(url_for('main.cart'))

@bp.route('/checkout', methods=['GET', 'POST'])
def checkout():
    if 'user_id' not in session:
        return redirect(url_for('auth.signin'))
        
    cart = session.get('cart', [])
    if not cart:
        flash('Your cart is empty', 'error')
        return redirect(url_for('main.menu'))
        
    if request.method == 'POST':
        # ... (Payment logic would go here)
        
        # Calculate totals
        subtotal = sum(item['price'] * item['quantity'] for item in cart)
        tax = subtotal * current_app.config['TAX_RATE']
        delivery_fee = current_app.config['DELIVERY_FEE']
        tip = 0 # Simplified for now
        total = subtotal + tax + delivery_fee + tip
        
        db = get_db()
        cursor = db.execute(
            "INSERT INTO orders (user_id, subtotal, tax, delivery_fee, tip, total, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (session['user_id'], subtotal, tax, delivery_fee, tip, total, 'pending')
        )
        order_id = cursor.lastrowid
        
        # Insert items
        for item in cart:
            db.execute(
                "INSERT INTO order_items (order_id, item_id, name, price, quantity, allergies) VALUES (?, ?, ?, ?, ?, ?)",
                (order_id, item['item_id'], item['name'], item['price'], item['quantity'], item['allergies'])
            )
            
        db.commit()
        session['cart'] = []
        session.modified = True
        flash(f'Order #{order_id} placed successfully!', 'success')
        return redirect(url_for('main.order_confirmation', order_id=order_id))
        
    subtotal = sum(item['price'] * item['quantity'] for item in cart)
    tax = subtotal * current_app.config['TAX_RATE']
    delivery_fee = current_app.config['DELIVERY_FEE']
    
    return render_template('checkout.html', 
                         cart=cart, 
                         subtotal=subtotal, 
                         tax=tax, 
                         delivery_fee=delivery_fee, 
                         total=subtotal+tax+delivery_fee,
                         user_name=session.get('user_name'))

@bp.route('/order_confirmation/<int:order_id>')
def order_confirmation(order_id):
    if 'user_id' not in session:
        return redirect(url_for('auth.signin'))
        
    db = get_db()
    order = db.execute("SELECT * FROM orders WHERE order_id = ? AND user_id = ?", (order_id, session['user_id'])).fetchone()
    if not order:
        flash('Order not found', 'error')
        return redirect(url_for('main.menu'))
        
    items = db.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,)).fetchall()
    
    # Convert row objects to dicts and attach items
    order_dict = dict(order)
    order_dict['items'] = [dict(item) for item in items]
    
    return render_template('order_confirmation.html', order=order_dict, user_name=session.get('user_name'))

@bp.route('/orders')
def orders():
    if 'user_id' not in session:
        return redirect(url_for('auth.signin'))
        
    db = get_db()
    # Pagination could be added here
    orders = db.execute(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", 
        (session['user_id'],)
    ).fetchall()
    
    orders_display = []
    for o in orders:
        o_dict = dict(o)
        items = db.execute("SELECT * FROM order_items WHERE order_id = ?", (o['order_id'],)).fetchall()
        o_dict['items'] = [dict(item) for item in items]
        orders_display.append(o_dict)
        
    return render_template('orders.html', orders=orders_display, user_name=session.get('user_name'))

@bp.route('/wishlist', methods=['GET', 'POST'])
def wishlist():
    if 'user_id' not in session:
        return redirect(url_for('auth.signin'))
        
    db = get_db()
    if request.method == 'POST':
        item_id = request.form.get('item_id')
        try:
            db.execute("INSERT INTO wishlist (user_id, item_id) VALUES (?, ?)", (session['user_id'], item_id))
            db.commit()
            flash('Added to favorites', 'success')
        except db.IntegrityError:
            flash('Already in favorites', 'info')
        return redirect(url_for('main.menu'))
        
    wishlist_items = db.execute("""
        SELECT m.* FROM menu_items m
        JOIN wishlist w ON m.item_id = w.item_id
        WHERE w.user_id = ?
    """, (session['user_id'],)).fetchall()
    
    return render_template('wishlist.html', wishlist=wishlist_items, user_name=session.get('user_name'))

@bp.route('/remove_from_wishlist/<int:item_id>') # Changed from index to item_id
def remove_from_wishlist(item_id): # Changed from index to item_id
    if 'user_id' in session:
        db = get_db()
        db.execute("DELETE FROM wishlist WHERE user_id = ? AND item_id = ?", (session['user_id'], item_id))
        db.commit()
    return redirect(url_for('main.wishlist'))

@bp.route('/about')
def about():
    return render_template('about.html', user_name=session.get('user_name'))

@bp.route('/contact')
def contact():
    return render_template('contact.html', user_name=session.get('user_name'))
