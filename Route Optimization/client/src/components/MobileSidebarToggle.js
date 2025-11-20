import React from 'react';
import './MobileSidebarToggle.css';

function MobileSidebarToggle({ isOpen, onToggle }) {
  return (
    <button 
      className={`mobile-sidebar-toggle ${isOpen ? 'open' : ''}`}
      onClick={onToggle}
      aria-label="Toggle sidebar"
    >
      <span className="toggle-icon">
        {isOpen ? '▼' : '▲'}
      </span>
    </button>
  );
}

export default MobileSidebarToggle;

