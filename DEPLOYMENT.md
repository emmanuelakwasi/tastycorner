# Deployment Guide

## Pre-Deployment Checklist

### ✅ Security Checklist

1. **Change Secret Key**
   - Generate a strong secret key: `python -c "import secrets; print(secrets.token_hex(32))"`
   - Set it as environment variable: `SECRET_KEY=your-generated-key`
   - Never commit the actual secret key to GitHub

2. **Change Admin Credentials**
   - Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables
   - Remove default values from code (already done - uses env vars)

3. **Review .gitignore**
   - Ensure `data/`, `*.db`, `*.csv`, `.env` are ignored
   - Check that no sensitive files are tracked

4. **Environment Variables**
   - Copy `.env.example` to `.env` (don't commit `.env`)
   - Set all required environment variables
   - Use different values for production

### 📦 Files to Review Before Committing

- ✅ `.gitignore` - Excludes sensitive data
- ✅ `requirements.txt` - All dependencies listed
- ✅ `README.md` - Updated with current features
- ✅ `app.py` - No hardcoded secrets (uses env vars)
- ✅ `.env.example` - Template for environment variables

### 🚀 Deployment Steps

#### For Heroku/Railway/Render:

1. **Set Environment Variables** in your hosting platform:
   ```
   SECRET_KEY=<generate-a-strong-key>
   ADMIN_EMAIL=<your-admin-email>
   ADMIN_PASSWORD=<strong-password>
   FLASK_ENV=production
   FLASK_DEBUG=0
   ```

2. **Add Buildpacks** (if needed):
   - Python buildpack
   - Node.js buildpack (if using Route Optimization)

3. **Database Setup**:
   - The app uses SQLite by default (employees.db)
   - For production, consider PostgreSQL or MySQL
   - Update database connection in `app.py` if needed

4. **Static Files**:
   - Ensure `static/` folder is included
   - Images should be in `static/images/`

5. **Run Migrations**:
   - Database will be created automatically on first run
   - CSV files will be created if they don't exist

#### For Traditional VPS/Server:

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Set Environment Variables**:
   ```bash
   export SECRET_KEY="your-secret-key"
   export ADMIN_EMAIL="admin@example.com"
   export ADMIN_PASSWORD="secure-password"
   export FLASK_ENV=production
   ```

3. **Use Gunicorn or uWSGI**:
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:8000 app:app
   ```

4. **Set up Reverse Proxy** (Nginx):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

5. **Set up SSL** (Let's Encrypt):
   ```bash
   certbot --nginx -d yourdomain.com
   ```

### 🔒 Security Best Practices

1. **Never commit**:
   - `.env` file
   - `data/` folder (contains user data)
   - `*.db` files (SQLite databases)
   - Actual API keys or secrets

2. **Use Environment Variables** for:
   - Secret keys
   - Admin credentials
   - API keys (Google Maps, etc.)
   - Database credentials

3. **Production Settings**:
   - Set `FLASK_ENV=production`
   - Set `FLASK_DEBUG=0`
   - Use HTTPS
   - Enable CSRF protection (Flask-WTF)

4. **Database Security**:
   - Use strong passwords
   - Restrict database access
   - Regular backups

### 📝 Post-Deployment

1. **Test Admin Login**:
   - Verify admin credentials work
   - Test all admin functions

2. **Test User Registration**:
   - Create a test account
   - Verify email/password requirements

3. **Test Order Flow**:
   - Add items to cart
   - Complete checkout
   - Verify order appears in admin

4. **Test Employee Features**:
   - Worker login
   - Driver login
   - Dashboard access

5. **Monitor Logs**:
   - Check for errors
   - Monitor performance
   - Watch for security issues

### 🐛 Troubleshooting

**Issue**: Database errors
- **Solution**: Ensure `data/` folder exists and is writable

**Issue**: Static files not loading
- **Solution**: Check `static/` folder path and permissions

**Issue**: Session not working
- **Solution**: Verify `SECRET_KEY` is set correctly

**Issue**: Admin login fails
- **Solution**: Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables

### 📚 Additional Resources

- Flask Deployment: https://flask.palletsprojects.com/en/latest/deploying/
- Environment Variables: https://12factor.net/config
- Security Best Practices: https://owasp.org/www-project-top-ten/

