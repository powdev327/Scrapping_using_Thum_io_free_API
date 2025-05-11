// src/components/ui/Button.jsx

import React from 'react';

const Button = ({ onClick, children, className = '', variant }) => {
  const baseStyle = 'px-4 py-2 rounded text-white';
  let variantStyle = 'bg-blue-600'; // Default variant;

  switch (variant) {
    case 'destructive':
      variantStyle = 'bg-red-600';
      break;
    case 'secondary':
      variantStyle = 'bg-gray-600';
      break;
    // Add more variants as needed
    default:
      break;
  }

  return (
    <button onClick={onClick} className={`${baseStyle} ${variantStyle} ${className}`}>
      {children}
    </button>
  );
};

export default Button;
