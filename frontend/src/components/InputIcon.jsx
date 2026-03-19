import React from 'react';
import './InputIcon.css';

export default function InputIcon({
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  icon,
  required
}) {
  return (
    <div className="input-wrapper">
      {icon && <div className="input-icon">{icon}</div>}
      <input
        type={type}
        name={name}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}
