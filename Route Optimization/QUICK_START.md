# Quick Start Guide

Get your Food Truck Route Optimizer up and running in minutes!

## Installation

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

   This starts:
   - Backend server on `http://localhost:5000`
   - React frontend on `http://localhost:3000`

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## First Steps

### 1. Set Your Start Location

- Click "📍 Use Current Location" to use your GPS location
- Or manually set coordinates by clicking on the map

### 2. Add Delivery Stops

**Option A: Click on Map**
- Click anywhere on the map
- Enter a stop name when prompted
- The stop will be added automatically

**Option B: Use Add Stop Form**
- Click "+ Add Stop" in the sidebar
- Fill in the details:
  - Stop name
  - Address (optional)
  - Latitude and Longitude
  - Priority level (High/Medium/Low)
  - Urgent delivery checkbox
  - Time window (optional)

### 3. Configure Options

- **Enable Clustering**: Groups nearby stops together
- **Cluster Distance**: Maximum distance (km) for clustering

### 4. Optimize Your Route

- Click "🚀 Optimize Route"
- View the optimized route on the map
- Check route statistics in the sidebar

## Features Overview

### Priority Levels
- **High Priority (1)**: Delivered first
- **Medium Priority (2)**: Normal delivery
- **Low Priority (3)**: Delivered last

### Urgent Deliveries
- Mark stops as urgent for immediate routing
- Urgent stops get priority in optimization

### Time Windows
- Set delivery time windows
- Optimizer ensures timely delivery
- Penalizes late arrivals

### Route Statistics
- Total distance
- Estimated delivery time
- Average distance per stop
- Total number of stops

## Tips for Best Results

1. **Set Realistic Priorities**: Don't mark everything as high priority
2. **Use Time Windows**: Especially for scheduled deliveries
3. **Enable Clustering**: For dense urban areas
4. **Update Start Location**: Keep it current with your truck's position
5. **Review Route**: Check the optimized route before starting delivery

## Troubleshooting

### Map Not Loading
- Check your internet connection
- Ensure Leaflet CSS is loading correctly

### Route Not Optimizing
- Ensure you have at least one stop added
- Check that start location is set
- Verify all stops have valid coordinates

### API Errors
- Check that the backend server is running
- Verify the API URL in `.env` file
- Check browser console for errors

## Next Steps

- Read the [README.md](README.md) for detailed documentation
- Check [INTEGRATION.md](INTEGRATION.md) for API integration
- Customize the app for your specific needs

Happy optimizing! 🚚

