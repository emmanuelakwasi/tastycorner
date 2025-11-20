import os
import csv
import json
import sqlite3
import sys

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.db import init_db, get_db

def migrate():
    app = create_app()
    with app.app_context():
        print("Initializing new database...")
        init_db()
        db = get_db()
        
        data_dir = app.config['DATA_DIR']
        
        # 1. Migrate Users
        users_csv = os.path.join(data_dir, 'users.csv')
        if os.path.exists(users_csv):
            print("Migrating users...")
            with open(users_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                users = []
                for row in reader:
                    users.append((
                        row['user_id'],
                        row['email'],
                        row['password_hash'],
                        row['name'],
                        row['phone'],
                        row['address'],
                        row['created_at']
                    ))
                db.executemany(
                    "INSERT OR IGNORE INTO users (user_id, email, password_hash, name, phone, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    users
                )
                print(f"Migrated {len(users)} users.")

        # 2. Migrate Menu Items
        menu_csv = os.path.join(data_dir, 'menu.csv')
        if os.path.exists(menu_csv):
            print("Migrating menu items...")
            with open(menu_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                items = []
                for row in reader:
                    items.append((
                        row['item_id'],
                        row['name'],
                        row['description'],
                        row['price'],
                        row['category'],
                        row.get('image', '')
                    ))
                db.executemany(
                    "INSERT OR IGNORE INTO menu_items (item_id, name, description, price, category, image) VALUES (?, ?, ?, ?, ?, ?)",
                    items
                )
                print(f"Migrated {len(items)} menu items.")

        # 3. Migrate Coupons
        coupons_csv = os.path.join(data_dir, 'coupons.csv')
        if os.path.exists(coupons_csv):
            print("Migrating coupons...")
            with open(coupons_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                coupons = []
                for row in reader:
                    coupons.append((
                        row['code'],
                        row['discount_type'],
                        row['discount_value'],
                        row.get('min_order', 0),
                        row.get('max_discount'),
                        row.get('usage_limit'),
                        row.get('used_count', 0),
                        row.get('expiry_date'),
                        1 if row.get('is_active', 'true').lower() == 'true' else 0
                    ))
                db.executemany(
                    "INSERT OR IGNORE INTO coupons (code, discount_type, discount_value, min_order, max_discount, usage_limit, used_count, expiry_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    coupons
                )
                print(f"Migrated {len(coupons)} coupons.")

        # 4. Migrate Orders & Order Items
        orders_csv = os.path.join(data_dir, 'orders.csv')
        if os.path.exists(orders_csv):
            print("Migrating orders...")
            with open(orders_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                count = 0
                for row in reader:
                    # Insert Order
                    cursor = db.execute(
                        """INSERT OR IGNORE INTO orders 
                           (order_id, user_id, subtotal, tax, delivery_fee, tip, total, status, coupon_code, discount, created_at) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (
                            row['order_id'],
                            row['user_id'],
                            row['subtotal'],
                            row['tax'],
                            row['delivery_fee'],
                            row['tip'],
                            row['total'],
                            row['status'],
                            row.get('coupon_code'),
                            row.get('discount', 0),
                            row['created_at']
                        )
                    )
                    
                    # Insert Order Items
                    try:
                        items = json.loads(row['items'])
                        for item in items:
                            db.execute(
                                """INSERT INTO order_items (order_id, item_id, name, price, quantity, allergies)
                                   VALUES (?, ?, ?, ?, ?, ?)""",
                                (
                                    row['order_id'],
                                    item.get('item_id'),
                                    item['name'],
                                    item['price'],
                                    item['quantity'],
                                    item.get('allergies', '')
                                )
                            )
                    except json.JSONDecodeError:
                        print(f"Failed to parse items for order {row['order_id']}")
                    
                    count += 1
                print(f"Migrated {count} orders.")

        # 5. Migrate Employees (from old SQLite)
        old_db_path = os.path.join(data_dir, 'employees.db')
        if os.path.exists(old_db_path):
            print("Migrating employees...")
            # Attach old DB
            db.execute(f"ATTACH DATABASE '{old_db_path}' AS old_db")
            
            # Copy Employees
            # We need to handle schema differences carefully. 
            # The new schema has 'schedule' as TEXT (JSON), same as old.
            # We'll select common columns.
            try:
                db.execute("""
                    INSERT OR IGNORE INTO main.employees 
                    (employee_id, first_name, last_name, email, gender, dob, mobile, address, job_title, notes, status, schedule, hours_this_period, last_paid_date, profile_picture, hourly_rate, created_at)
                    SELECT 
                        employee_id, first_name, last_name, email, gender, dob, mobile, address, job_title, notes, status, schedule, hours_this_period, last_paid_date, profile_picture, hourly_rate, created_at
                    FROM old_db.employees
                """)
                
                # Copy Attendance
                db.execute("""
                    INSERT OR IGNORE INTO main.attendance
                    (employee_id, date, check_in_time, check_out_time, hours_worked, created_at)
                    SELECT 
                        employee_id, date, check_in_time, check_out_time, hours_worked, created_at
                    FROM old_db.attendance
                """)
                print("Migrated employees and attendance.")
            except sqlite3.Error as e:
                print(f"Error migrating employees: {e}")
            finally:
                db.execute("DETACH DATABASE old_db")

        db.commit()
        print("Migration complete!")

if __name__ == '__main__':
    migrate()
