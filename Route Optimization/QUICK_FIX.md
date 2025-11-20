# Quick Fix Guide

## The Issue
Node.js is not installed on your computer. Node.js is required to run this application.

## Fastest Solution (2 Steps)

### Step 1: Install Node.js

**Easiest way:**
1. Go to: **https://nodejs.org/**
2. Click the big green **"LTS"** button (left side)
3. Run the downloaded installer
4. Click "Next" through all prompts
5. **Restart your computer** (important!)

### Step 2: Run These Commands

After restarting, open a terminal in your project folder and run:

```bash
npm run install-all
npm run dev
```

That's it! The app will open at `http://localhost:3000`

---

## Alternative: Use Winget (If Available)

If you have Windows Package Manager, run this in PowerShell (as Admin):

```powershell
winget install OpenJS.NodeJS.LTS
```

Then restart your terminal and run:
```bash
npm run install-all
npm run dev
```

---

## Verify Node.js is Installed

After installing, open a NEW terminal and type:
```bash
node --version
```

You should see: `v20.x.x` or similar

If you see "command not found", restart your computer and try again.


