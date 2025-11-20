from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from app.db import get_db

bp = Blueprint('auth', __name__)

@bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        name = request.form.get('name')
        phone = request.form.get('phone')
        address = request.form.get('address')
        
        if not all([email, password, name, phone, address]):
            flash('Please fill in all fields', 'error')
            return render_template('signup.html')
        
        db = get_db()
        try:
            db.execute(
                "INSERT INTO users (email, password_hash, name, phone, address) VALUES (?, ?, ?, ?, ?)",
                (email, generate_password_hash(password), name, phone, address)
            )
            db.commit()
            flash('Account created successfully! Please sign in.', 'success')
            return redirect(url_for('auth.signin'))
        except db.IntegrityError:
            flash('Email already registered. Please sign in.', 'error')
            return render_template('signup.html')
    
    return render_template('signup.html')

@bp.route('/signin', methods=['GET', 'POST'])
def signin():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not email or not password:
            flash('Please enter email and password', 'error')
            return render_template('signin.html')
        
        db = get_db()
        user = db.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()
        
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['user_id']
            session['user_name'] = user['name']
            session['user_email'] = user['email']
            flash(f'Welcome back, {user["name"]}!', 'success')
            return redirect(url_for('main.menu'))
        else:
            flash('Invalid email or password', 'error')
            return render_template('signin.html')
    
    return render_template('signin.html')

@bp.route('/signout')
def signout():
    session.clear()
    flash('You have been signed out', 'info')
    return redirect(url_for('main.index'))
