# Pre-Deployment Checklist

## ✅ Before Pushing to GitHub

### 1. Security Review

- [x] **Secret Key**: Changed to use environment variable (`SECRET_KEY`)
- [x] **Admin Credentials**: Using environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`)
- [x] **`.gitignore`**: Updated to exclude:
  - `data/` folder (contains user data, orders, employees)
  - `*.db` files (SQLite databases)
  - `*.csv` files (data files)
  - `.env` file (environment variables)
  - `__pycache__/` (Python cache)

### 2. Files Created/Updated

- [x] **`.env.example`**: Template for environment variables (create manually if needed)
- [x] **`DEPLOYMENT.md`**: Complete deployment guide
- [x] **`README.md`**: Updated with current features
- [x] **`requirements.txt`**: All dependencies listed
- [x] **`.gitignore`**: Properly configured

### 3. Code Review

- [x] No hardcoded secrets in code
- [x] Environment variables used for sensitive data
- [x] Default values removed or clearly marked as development-only

### 4. Documentation

- [x] README.md updated with current features
- [x] Deployment guide created
- [x] Environment variables documented

## 🔧 Steps to Deploy

### Step 1: Generate Secret Key

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Save this key - you'll need it for deployment.

### Step 2: Create .env File (Local Development)

Create a `.env` file in the project root (this file is gitignored):

```env
SECRET_KEY=your-generated-secret-key-here
ADMIN_EMAIL=admin@tastycorner.com
ADMIN_PASSWORD=your-secure-password
GOOGLE_MAPS_API_KEY=your-api-key (optional)
FLASK_ENV=development
FLASK_DEBUG=1
```

### Step 3: Test Locally

```bash
# Activate virtual environment
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

Test all features:
- [ ] User registration/login
- [ ] Menu browsing
- [ ] Order placement
- [ ] Admin login
- [ ] Employee management
- [ ] Worker dashboard
- [ ] Driver dashboard

### Step 4: Prepare for GitHub

```bash
# Check what will be committed
git status

# Verify sensitive files are ignored
git check-ignore data/
git check-ignore .env
git check-ignore *.db

# Add files
git add .

# Commit
git commit -m "Initial commit - Restaurant Management System"

# Push to GitHub
git push origin main
```

### Step 5: Deploy to Production

See `DEPLOYMENT.md` for detailed instructions.

**Quick Heroku/Railway/Render Setup:**

1. Create account on hosting platform
2. Create new app/project
3. Set environment variables:
   - `SECRET_KEY` (from Step 1)
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `FLASK_ENV=production`
   - `FLASK_DEBUG=0`
4. Connect GitHub repository
5. Deploy!

## ⚠️ Important Reminders

1. **Never commit**:
   - `.env` file
   - `data/` folder
   - `*.db` files
   - Actual secret keys or passwords

2. **Always use environment variables** for:
   - Secret keys
   - API keys
   - Database credentials
   - Admin passwords

3. **Before each deployment**:
   - Test locally first
   - Review what's being committed
   - Check environment variables are set
   - Verify `.gitignore` is working

## 🐛 Common Issues

**Issue**: "Secret key is exposed"
- **Solution**: Ensure `.env` is in `.gitignore` and use environment variables

**Issue**: "Database file is tracked"
- **Solution**: Add `*.db` to `.gitignore` and remove from git: `git rm --cached *.db`

**Issue**: "User data is committed"
- **Solution**: Ensure `data/` is in `.gitignore` and remove: `git rm -r --cached data/`

## ✅ Final Checklist

Before pushing to GitHub:
- [ ] All sensitive data is in `.gitignore`
- [ ] `.env` file exists locally but is NOT committed
- [ ] `SECRET_KEY` uses environment variable
- [ ] Admin credentials use environment variables
- [ ] README.md is updated
- [ ] All features tested locally
- [ ] No hardcoded secrets in code
- [ ] `requirements.txt` is complete

You're ready to deploy! 🚀

