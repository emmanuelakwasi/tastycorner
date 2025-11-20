# Environment Variables Setup

## 🔑 Generated Secret Key

Your generated secret key is:

```
SECRET_KEY=9ac262676ac50190e4f3b5e969c21601d9fe1941eeb3561b28dd60828c573b62
```

**⚠️ Important**: 
- Keep this secret key secure
- Never commit it to GitHub
- Use different keys for development and production

## 📝 Complete .env File Template

Create a `.env` file in your project root with the following:

```env
# Flask Secret Key (REQUIRED)
SECRET_KEY=9ac262676ac50190e4f3b5e969c21601d9fe1941eeb3561b28dd60828c573b62

# Admin Credentials (REQUIRED)
ADMIN_EMAIL=admin@tastycorner.com
ADMIN_PASSWORD=your-secure-password-here

# Stripe Test Mode Keys (OPTIONAL - for payment processing)
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Flask Environment
FLASK_ENV=development
FLASK_DEBUG=1
```

## 🧪 Stripe Test Mode Setup

### Step 1: Get Stripe Test Keys

1. Go to [https://stripe.com](https://stripe.com) and create a free account
2. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
3. Make sure you're in **Test mode** (toggle in top right)
4. Go to **Developers** → **API keys**
5. Copy:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

### Step 2: Add to .env

```env
STRIPE_PUBLISHABLE_KEY=pk_test_51AbC123...your_key_here
STRIPE_SECRET_KEY=sk_test_51XyZ789...your_key_here
```

### Step 3: Test Cards

Use these test card numbers:

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0000 0000 0002` | ❌ Declined |
| `4000 0025 0000 3155` | 🔐 Requires 3D Secure |

**Test Details**:
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

## 🚀 Quick Start

1. **Create `.env` file**:
   ```bash
   # Copy the template above and fill in your values
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the app**:
   ```bash
   python app.py
   ```

## ✅ Verification

After setting up:

- [ ] `.env` file created with all variables
- [ ] Secret key set (different from default)
- [ ] Admin credentials set
- [ ] Stripe keys added (if using payments)
- [ ] App runs without errors
- [ ] Admin login works
- [ ] Test payment works (if Stripe configured)

## 🔒 Security Checklist

- [ ] `.env` is in `.gitignore` ✅
- [ ] Secret key is strong and unique
- [ ] Admin password is secure
- [ ] Stripe keys are test keys (not live)
- [ ] No secrets committed to Git

## 📚 More Information

- See `STRIPE_SETUP.md` for detailed Stripe setup
- See `DEPLOYMENT.md` for production deployment
- See `PRE_DEPLOYMENT_CHECKLIST.md` for pre-deployment steps

