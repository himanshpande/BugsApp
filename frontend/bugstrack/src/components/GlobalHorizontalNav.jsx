import React from 'react';
import './GlobalHorizontalNav.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const GlobalHorizontalNav = ({ items, activeItem, onItemClick, isDarkMode = false }) => {
  const containerClass = isDarkMode ? 'global-horizontal-nav dark' : 'global-horizontal-nav';

  return (
    <div className={containerClass}>
      <div className="global-nav-container">
        <div className="global-nav-items">
          {items.map((item) => (
            <button
              key={item.id}
              className={`global-nav-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => onItemClick(item.id)}
              disabled={item.disabled}
              title={item.label}
            >
              {item.icon && (
                <span className="global-nav-icon">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
              )}
              <span className="global-nav-label">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="global-nav-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalHorizontalNav;






