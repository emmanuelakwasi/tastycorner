import React from 'react';
import './ThemeToggle.css';

function ThemeToggle({ isDark, onToggle }) {
  return (
    <button 
      className={`ThemeToggle ${isDark ? 'dark' : 'light'}`}
      onClick={onToggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="ThemeToggle-icon">
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  );
}

export default ThemeToggle;

