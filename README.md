# TastyCorner Restaurant Management System

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0+-green.svg)
![SQLite](https://img.shields.io/badge/SQLite-Integrated-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A comprehensive, full-stack restaurant management system built with Flask and Python. Designed to streamline operations from customer ordering to delivery logistics.

## 🚀 Features

### 🛍️ Customer Experience
*   **Dynamic Menu**: Browse categories, search items, and view details.
*   **Cart & Checkout**: Seamless shopping experience with tax and delivery fee calculation.
*   **User Accounts**: Order history, favorites list, and profile management.
*   **Real-time Status**: Track order status from pending to delivery.

### 👨‍🍳 Employee Portal
*   **Role-Based Access**: Secure login for Workers and Drivers.
*   **Attendance Tracking**: Check-in/out system with hours calculation.
*   **Dashboard**: View schedules, payroll estimates, and personal stats.

### 🚚 Delivery & Logistics
*   **Driver Dashboard**: View assigned orders and delivery details.
*   **Route Optimization**: (Beta) Integrated tools for optimizing delivery routes.
*   **Status Updates**: Mark orders as delivered in real-time.

### 📊 Admin Dashboard
*   **Business Intelligence**: Real-time charts for sales, top items, and revenue.
*   **Management**: Full CRUD control over Menu, Employees, and Coupons.
*   **Order Processing**: Workflow to manage order lifecycle.

## 🛠️ Tech Stack

*   **Backend**: Python, Flask (Blueprints, Factory Pattern)
*   **Database**: SQLite (with schema migration support)
*   **Frontend**: HTML5, CSS3, JavaScript (Vanilla + React for Route Opt)
*   **Deployment**: Ready for Heroku/Render (Gunicorn configured)

## 🔧 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/tastycorner.git
    cd tastycorner
    ```

2.  **Create a Virtual Environment**
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configuration**
    Create a `.env` file in the root directory:
    ```env
    SECRET_KEY=your-secure-secret-key
    ADMIN_EMAIL=admin@tastycorner.com
    ADMIN_PASSWORD=secure_password
    FLASK_APP=run.py
    ```

5.  **Initialize Database**
    The application will automatically create `data/tastycorner.db` on first run.
    To manually reset:
    ```bash
    flask init-db
    ```

6.  **Run the Application**
    ```bash
    python run.py
    ```
    Visit `http://localhost:5000`

## 🚀 Deployment

This project includes a `Procfile` and is ready for deployment on platforms like Heroku or Render.

1.  **Push to GitHub**.
2.  **Connect to Render/Heroku**.
3.  **Set Environment Variables** (SECRET_KEY, etc.) in the dashboard.
4.  **Deploy**!

## 📂 Project Structure

```text
/
├── app/
│   ├── __init__.py    # App Factory
│   ├── db.py          # Database Connection
│   ├── routes/        # Blueprints (Auth, Main, Admin, etc.)
│   ├── static/        # CSS, Images, JS
│   └── templates/     # HTML Templates
├── data/              # SQLite Database (Gitignored)
├── scripts/           # Utility scripts
├── config.py          # Configuration Class
├── run.py             # Entry Point
└── requirements.txt   # Dependencies
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
