# 🚚 Food Truck Route Optimizer

A specialized route optimization application designed for food truck delivery drivers. This app provides unique features tailored for food truck operations, making it more than just a simple route planner.

## ✨ Unique Features

### 🎯 Food Truck-Specific Features
- **Priority-Based Routing**: Assign priority levels to deliveries (High, Medium, Low)
- **Urgent Delivery Handling**: Mark urgent deliveries for immediate routing
- **Time Windows**: Set delivery time windows to ensure timely service
- **Customer Clustering**: Automatically group nearby customers for efficient routing
- **Multi-Stop Optimization**: Optimize routes with multiple delivery stops
- **Real-Time Route Updates**: Dynamic route adjustment as deliveries are completed
- **Vehicle & Walking Routes**: Separate routes for driving (truck to parking) and walking (parking to delivery)
- **Parking Location Detection**: Automatically finds parking spots near delivery locations

### 🗺️ Interactive Map Interface
- **Address Search Bar with Autocomplete**: Type delivery addresses directly at the top of the page
  - **Real-time suggestions** as you type (Google Places Autocomplete)
  - **Keyboard navigation** (Arrow keys, Enter, Escape)
  - **Location-biased results** (prioritizes addresses near your start location)
  - **Click or keyboard select** suggestions
- Click-to-add stops directly on the map
- Visual route visualization with color-coded markers
- **Vehicle routes** (black line): Truck to parking locations
- **Walking routes** (green dashed line): Parking to delivery locations
- **Parking markers** (orange "P"): Shows where to park for each delivery
- Start location detection using GPS
- Distance and time estimates for each stop (vehicle + walking)
- Recent addresses for quick re-entry

### 📊 Route Statistics
- Total distance calculation
- **Vehicle distance and time** (driving routes)
- **Walking distance and time** (walking routes)
- Estimated delivery time
- Average distance per stop
- Route efficiency metrics

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and the React frontend (port 3000).

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
```

The built files will be in the `client/build` directory.

## 📁 Project Structure

```
food-truck-route-optimizer/
├── server/
│   ├── index.js              # Express server setup
│   ├── routes/
│   │   └── optimizer.js      # API routes for optimization
│   └── services/
│       └── routeOptimizer.js # Route optimization algorithm
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API service functions
│   │   └── App.js            # Main app component
│   └── package.json
└── package.json
```

## 🔌 API Integration

The app is designed to be easily integrated into a food truck management system. The API endpoints are:

### POST `/api/optimize`
Optimize a delivery route.

**Request Body:**
```json
{
  "stops": [
    {
      "id": 1,
      "name": "Customer Name",
      "lat": 40.7128,
      "lng": -74.0060,
      "address": "123 Main St",
      "priority": 1,
      "urgent": false,
      "timeWindow": {
        "start": 1609459200000,
        "end": 1609462800000
      }
    }
  ],
  "startLocation": {
    "lat": 40.7580,
    "lng": -73.9855,
    "name": "Food Truck Location"
  },
  "options": {
    "enableClustering": true,
    "clusterDistance": 2
  }
}
```

**Response:**
```json
{
  "route": [
    {
      "id": 1,
      "name": "Customer Name",
      "lat": 40.7128,
      "lng": -74.0060,
      "order": 1,
      "distanceFromPrevious": 2.5,
      "vehicleDistance": 2.8,
      "walkingDistance": 0.1,
      "parkingLocation": {
        "lat": 40.7130,
        "lng": -74.0058,
        "walkingDistance": 0.1,
        "estimatedWalkingTime": 1.0
      },
      "estimatedVehicleTime": 4.2,
      "estimatedWalkingTime": 1.0
    }
  ],
  "statistics": {
    "totalStops": 5,
    "totalDistance": 12.5,
    "totalVehicleDistance": 14.2,
    "totalWalkingDistance": 0.5,
    "estimatedTime": 18.75,
    "estimatedVehicleTime": 21.3,
    "estimatedWalkingTime": 5.0,
    "averageDistancePerStop": 2.5
  },
  "optimized": true,
  "routeType": "vehicle-and-walking"
}
```

## 🎨 Customization

### Adding New Features
The modular structure makes it easy to add new features:
- Add new optimization algorithms in `server/services/routeOptimizer.js`
- Create new UI components in `client/src/components/`
- Extend API endpoints in `server/routes/optimizer.js`

### Styling
The app uses CSS modules for component styling. Modify the `.css` files in each component directory to customize the appearance.

## 🚀 Enhanced Features (Now Available!)

- **Google Maps Integration**: Real road routes and parking detection (optional API key)
- **Turn-by-Turn Navigation**: Detailed navigation instructions for drivers
- **Parking API Integration**: Real parking location detection (when API key provided)
- **Traffic-Aware Routing**: Account for traffic conditions (when API key provided)
- **Route Instructions**: Step-by-step guide for each delivery

## 🔮 Future Enhancements

- Driver performance tracking
- Customer feedback integration
- Mobile app version
- Offline mode support
- Route history and analytics
- Multi-vehicle optimization
- Integration with food truck POS systems

## 📝 License

MIT

## 🤝 Contributing

This app is designed to be integrated into a larger food truck management system. Contributions and feature requests are welcome!

---

**Built with ❤️ for food truck operators**

