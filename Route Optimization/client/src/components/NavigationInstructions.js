import React from 'react';
import './NavigationInstructions.css';

function NavigationInstructions({ instructions, simpleInstructions, summary }) {
  if (!instructions && !simpleInstructions && !summary) {
    return null;
  }

  const getInstructionIcon = (type) => {
    switch (type) {
      case 'start':
        return '🚚';
      case 'drive':
        return '🚗';
      case 'park':
        return '🅿️';
      case 'walk':
        return '🚶';
      case 'deliver':
        return '📦';
      case 'continue':
        return '➡️';
      case 'end':
        return '✅';
      default:
        return '📍';
    }
  };

  const getInstructionColor = (type) => {
    switch (type) {
      case 'start':
        return '#000000';
      case 'drive':
        return '#0066cc';
      case 'park':
        return '#ffa500';
      case 'walk':
        return '#00cc00';
      case 'deliver':
        return '#cc0000';
      case 'continue':
        return '#666666';
      case 'end':
        return '#00cc00';
      default:
        return '#333333';
    }
  };

  return (
    <div className="NavigationInstructions">
      <h3>📋 Navigation Instructions</h3>
      
      {summary && (
        <div className="NavigationInstructions-summary">
          <pre>{summary}</pre>
        </div>
      )}

      {simpleInstructions && simpleInstructions.length > 0 && (
        <div className="NavigationInstructions-simple">
          <h4>Quick Guide</h4>
          <div className="instructions-list">
            {simpleInstructions.map((instruction, index) => (
              <div key={index} className="instruction-item simple">
                <div className="instruction-header">
                  <span className="instruction-number">#{instruction.step}</span>
                  <span className="instruction-name">{instruction.name}</span>
                  {instruction.urgent && <span className="urgent-badge">⚡ URGENT</span>}
                </div>
                <div className="instruction-details">
                  {instruction.drive && (
                    <div className="detail-item">
                      <span className="detail-icon">🚗</span>
                      <span>Drive: {instruction.drive} ({instruction.driveTime})</span>
                    </div>
                  )}
                  {instruction.walk && (
                    <div className="detail-item">
                      <span className="detail-icon">🚶</span>
                      <span>Walk: {instruction.walk} ({instruction.walkTime})</span>
                    </div>
                  )}
                  {instruction.parking && (
                    <div className="detail-item">
                      <span className="detail-icon">🅿️</span>
                      <span>Park: {instruction.parking}</span>
                    </div>
                  )}
                  {instruction.address && (
                    <div className="detail-item address">
                      <span>{instruction.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {instructions && instructions.length > 0 && (
        <div className="NavigationInstructions-detailed">
          <h4>Detailed Instructions</h4>
          <div className="instructions-list">
            {instructions.map((instruction, index) => (
              <div 
                key={index} 
                className="instruction-item detailed"
                style={{ borderLeftColor: getInstructionColor(instruction.type) }}
              >
                <div className="instruction-icon">
                  {getInstructionIcon(instruction.type)}
                </div>
                <div className="instruction-content">
                  <div className="instruction-text">{instruction.instruction}</div>
                  {instruction.distance > 0 && (
                    <div className="instruction-meta">
                      {instruction.distance.toFixed(2)} km
                      {instruction.duration > 0 && ` • ${Math.round(instruction.duration)} min`}
                    </div>
                  )}
                  {instruction.stopName && (
                    <div className="instruction-stop">
                      Stop #{instruction.stopNumber}: {instruction.stopName}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NavigationInstructions;

