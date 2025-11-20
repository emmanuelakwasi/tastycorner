import React from 'react';
import './RouteExport.css';

function RouteExport({ optimizedRoute, startLocation }) {
  if (!optimizedRoute || !optimizedRoute.route) {
    return null;
  }

  const exportToJSON = () => {
    const data = {
      startLocation,
      route: optimizedRoute.route,
      statistics: optimizedRoute.statistics,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `route-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['Order', 'Name', 'Address', 'Latitude', 'Longitude', 'Distance (km)', 'Priority'];
    const rows = optimizedRoute.route.map(stop => [
      stop.order || '',
      stop.name || '',
      stop.address || '',
      stop.lat || '',
      stop.lng || '',
      stop.distanceFromPrevious?.toFixed(2) || '',
      stop.priority || ''
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `route-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const routeText = optimizedRoute.route.map(stop => 
      `${stop.order}. ${stop.name} - ${stop.address || `${stop.lat}, ${stop.lng}`}`
    ).join('\n');
    
    navigator.clipboard.writeText(routeText).then(() => {
      alert('Route copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  return (
    <div className="RouteExport">
      <h3>Export Route</h3>
      <div className="RouteExport-buttons">
        <button onClick={exportToJSON} className="RouteExport-button">
          📄 Export JSON
        </button>
        <button onClick={exportToCSV} className="RouteExport-button">
          📊 Export CSV
        </button>
        <button onClick={copyToClipboard} className="RouteExport-button">
          📋 Copy Route
        </button>
      </div>
    </div>
  );
}

export default RouteExport;

