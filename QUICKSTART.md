# Quick Start Guide

## Step 1: Install Python
Make sure you have Python 3.8 or higher installed on your computer.
- Download from: https://www.python.org/downloads/
- During installation, check "Add Python to PATH"

## Step 2: Install Dependencies
Open your terminal/command prompt in the project folder and run:
```bash
pip install -r requirements.txt
```

## Step 3: Run the Application
Start the Flask server:
```bash
python app.py
```

You should see output like:
```
 * Running on http://127.0.0.1:5000
```

## Step 4: Open in Browser
Open your web browser and go to:
```
http://localhost:5000
```

## Step 5: Create an Account
1. Click "Sign Up" in the navigation
2. Fill in all the required information:
   - Full Name
   - Email
   - Phone Number
   - Delivery Address
   - Password
3. Click "Sign Up"

## Step 6: Start Ordering!
1. Browse the menu
2. Select items and quantities
3. Add any allergy information (optional)
4. Click "Add to Cart"
5. Go to your cart and click "Proceed to Checkout"
6. Select your tip preference
7. Place your order!

## Adding Your Images

1. Place your menu item images in the `static/images/` folder
2. Name them according to the menu CSV (e.g., `burger.jpg`, `pizza.jpg`)
3. Supported formats: JPG, PNG, GIF
4. Recommended size: 600x400 pixels

## Changing Menu Items

Edit the file: `data/menu.csv`

Format: `item_id, name, description, price, category, image`

Example:
```
7, Grilled Chicken, Tender grilled chicken breast with vegetables, 15.99, Main Course, chicken.jpg
```

## Important Notes

- **Change the secret key**: In `app.py`, change `app.secret_key` to a random string for security
- **Data Storage**: All data is stored in CSV files in the `data/` folder
- **Tax Rate**: Currently set to 9.45% (Louisiana average). You can adjust this in `app.py`
- **Delivery Fee** 5.99

## Troubleshooting

**Problem**: "Module not found" error
- **Solution**: Run `pip install -r requirements.txt` again

**Problem**: Port 5000 already in use
- **Solution**: Change the port in `app.py` last line to `app.run(debug=True, port=5001)`

**Problem**: Images not showing
- **Solution**: Make sure images are in `static/images/` folder with correct filenames

## Next Steps

- Add your real menu images
- Customize the menu items
- Later: Add admin panel, worker dashboard, and delivery driver interface
- Later: Connect Stripe for real payments
- Later: Migrate from CSV to SQL database



