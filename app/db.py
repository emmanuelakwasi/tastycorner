import sqlite3
import click
from flask import current_app, g
from flask.cli import with_appcontext
import os
import json

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE_URI'].replace('sqlite:///', ''),
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

def init_db():
    db = get_db()
    
    # Enable foreign keys
    db.execute("PRAGMA foreign_keys = ON")
    
    # Create Tables
    db.executescript('''
        -- Users Table
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT,
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Employees Table (Merged from existing schema)
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT UNIQUE NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            gender TEXT,
            dob TEXT,
            mobile TEXT,
            address TEXT,
            job_title TEXT,
            notes TEXT,
            status TEXT DEFAULT 'active',
            schedule TEXT, -- JSON string
            hours_this_period REAL DEFAULT 0,
            last_paid_date TEXT,
            profile_picture TEXT,
            hourly_rate REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Menu Items Table
        CREATE TABLE IF NOT EXISTS menu_items (
            item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            image TEXT,
            is_active BOOLEAN DEFAULT 1
        );

        -- Orders Table
        CREATE TABLE IF NOT EXISTS orders (
            order_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            subtotal REAL NOT NULL,
            tax REAL NOT NULL,
            delivery_fee REAL NOT NULL,
            tip REAL DEFAULT 0,
            total REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            coupon_code TEXT,
            discount REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (user_id)
        );

        -- Order Items Table (New for normalization)
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            item_id INTEGER,
            name TEXT NOT NULL, -- Snapshot of name at time of order
            price REAL NOT NULL, -- Snapshot of price
            quantity INTEGER NOT NULL,
            allergies TEXT,
            FOREIGN KEY (order_id) REFERENCES orders (order_id),
            FOREIGN KEY (item_id) REFERENCES menu_items (item_id)
        );

        -- Coupons Table
        CREATE TABLE IF NOT EXISTS coupons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
            discount_value REAL NOT NULL,
            min_order REAL DEFAULT 0,
            max_discount REAL,
            usage_limit INTEGER,
            used_count INTEGER DEFAULT 0,
            expiry_date TEXT,
            is_active BOOLEAN DEFAULT 1
        );
        
        -- Attendance Table
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id TEXT NOT NULL,
            date TEXT NOT NULL,
            check_in_time TEXT,
            check_out_time TEXT,
            hours_worked REAL DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees (employee_id),
            UNIQUE(employee_id, date)
        );
        
        -- Wishlist (New Table)
        CREATE TABLE IF NOT EXISTS wishlist (
            user_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, item_id),
            FOREIGN KEY (user_id) REFERENCES users (user_id),
            FOREIGN KEY (item_id) REFERENCES menu_items (item_id)
        );
    ''')

@click.command('init-db')
@with_appcontext
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')

def init_app_db(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
