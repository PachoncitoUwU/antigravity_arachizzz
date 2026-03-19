import React from 'react';
import './Button.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  type = 'button',
  icon,
  onClick,
  disabled
}) {
  const className = `btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''}`;
  
  return (
    <button 
      type={type} 
      className={className} 
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
}
