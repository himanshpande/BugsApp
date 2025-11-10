import React from 'react';
import './HorizontalNav.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const HorizontalNav = ({ items, activeItem, onItemClick, isDarkMode = false }) => {
  const containerClass = isDarkMode ? 'horizontal-nav dark' : 'horizontal-nav';

  return (
    <div className={containerClass}>
      <div className="horizontal-nav-container">
        {items.map((item) => (
          <button
            key={item.id}
            className={`horizontal-nav-item ${activeItem === item.id ? 'active' : ''}`}
            onClick={() => onItemClick(item.id)}
            disabled={item.disabled}
          >
            {item.icon && (
              <span className="nav-item-icon">
                <FontAwesomeIcon icon={item.icon} />
              </span>
            )}
            <span className="nav-item-label">{item.label}</span>
            {item.badge && (
              <span className="nav-item-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HorizontalNav;



