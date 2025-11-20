# Quick Guide: Build React Route Optimizer

## The Problem
The route optimizer shows "Not Found" because the React app hasn't been built yet.

## Solution: Build the React App

### Step 1: Open Terminal/Command Prompt
Navigate to the project root: `C:\Users\USER\Desktop\res`

### Step 2: Navigate to React App
```bash
cd "Route Optimization\client"
```

### Step 3: Install Dependencies (if not done)
```bash
npm install
```

### Step 4: Build the App
```bash
npm run build
```

This will create a `build` folder with all the optimized files.

### Step 5: Copy Build Files (Optional)
The Flask app will automatically serve from the build folder, but for production you can copy to static:

```bash
# From project root (res/)
mkdir static\route-optimizer
xcopy /E /I "Route Optimization\client\build\*" "static\route-optimizer\"
```

Or manually copy the entire contents of `Route Optimization/client/build/` to `static/route-optimizer/`

## After Building

1. Restart your Flask server
2. Go to `/driver/login`
3. Login as a delivery driver
4. Click "Open Route Optimizer"
5. The React app should now load!

## Troubleshooting

**"npm: command not found"**
- Install Node.js from https://nodejs.org/

**Build errors**
- Check that all dependencies are installed: `npm install`
- Check for any error messages in the terminal

**Still showing "Not Found"**
- Make sure Flask server is restarted
- Check that build folder exists: `Route Optimization\client\build\`
- Verify `index.html` exists in the build folder

