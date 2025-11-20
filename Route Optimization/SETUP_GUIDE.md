# Step-by-Step Setup Guide

Follow these steps to get your Food Truck Route Optimizer running!

## Step 1: Install Node.js

### Option A: Using Windows Package Manager (Recommended - Fastest)

1. **Open PowerShell as Administrator:**
   - Press `Windows Key + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"

2. **Run this command:**
   ```powershell
   winget install OpenJS.NodeJS.LTS
   ```

3. **Wait for installation to complete** (takes 2-3 minutes)

4. **Close and reopen your terminal/command prompt**

### Option B: Manual Installation (If Option A doesn't work)

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - Click the big green "LTS" button (recommended version)
   - This downloads the installer

2. **Run the installer:**
   - Double-click the downloaded `.msi` file
   - Click "Next" through all the prompts
   - **IMPORTANT:** Make sure "Add to PATH" is checked (it should be by default)
   - Click "Install"
   - Wait for installation to complete

3. **Verify installation:**
   - Close ALL terminal/command prompt windows
   - Open a NEW terminal/command prompt
   - Type: `node --version`
   - You should see something like: `v20.x.x`
   - Type: `npm --version`
   - You should see something like: `10.x.x`

## Step 2: Install Project Dependencies

1. **Open a terminal in your project folder:**
   - Navigate to: `C:\Users\patri\OneDrive\Documents\Route Optimization`
   - Or right-click in the folder and select "Open in Terminal" or "Open PowerShell here"

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```
   
   This will:
   - Install backend dependencies (Express, CORS, etc.)
   - Install frontend dependencies (React, Leaflet, etc.)
   - Takes 2-5 minutes depending on your internet speed

3. **Wait for it to complete** - you'll see "added X packages" messages

## Step 3: Start the Application

1. **In the same terminal, run:**
   ```bash
   npm run dev
   ```

2. **You should see:**
   ```
   Server running on port 5000
   Compiled successfully!
   ```

3. **The app will automatically open in your browser at:**
   - `http://localhost:3000`

## Step 4: Use the App!

1. **Set your start location:**
   - Click "📍 Use Current Location" (allows GPS access)
   - Or click on the map to set a location

2. **Add delivery addresses:**
   - **Easiest way**: Type addresses in the search bar at the top of the page
   - **Autocomplete suggestions appear** as you type (after 3+ characters)
   - **Select a suggestion** by clicking it or using arrow keys + Enter
   - Or continue typing and press Enter to add
   - Address is automatically converted to coordinates
   - **Alternative ways**:
     - Click anywhere on the map to add a stop
     - Use the "+ Add Stop (Manual)" button in the sidebar for advanced options

3. **Optimize route:**
   - Click "🚀 Optimize Route"
   - See your optimized route on the map!

## Troubleshooting

### "npm is not recognized"
- **Solution:** Node.js isn't installed or not in PATH
- Close ALL terminal windows
- Reopen terminal and try again
- If still not working, restart your computer after installing Node.js

### "Port 3000 already in use"
- **Solution:** Another app is using port 3000
- Close other applications
- Or change the port in `client/package.json`

### "Port 5000 already in use"
- **Solution:** Backend port is in use
- Close other Node.js applications
- Or change PORT in `server/index.js`

### "Cannot find module"
- **Solution:** Dependencies not installed
- Run: `npm run install-all` again

### Map not loading
- **Solution:** Check internet connection
- Leaflet map tiles need internet to load

### "EACCES" or permission errors
- **Solution:** Run terminal as Administrator
- Or install dependencies without sudo (should work on Windows)

## Quick Commands Reference

```bash
# Install dependencies
npm run install-all

# Start the app
npm run dev

# Stop the app
Press Ctrl+C in the terminal

# Build for production
npm run build
```

## Need Help?

If you encounter any errors:
1. Copy the exact error message
2. Check which step you're on
3. Look at the Troubleshooting section above
4. Make sure Node.js is installed: `node --version`

---

**Once Node.js is installed, everything else is automatic!** 🚀


