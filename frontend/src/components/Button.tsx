import React from 'react';

export interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return (
    <button onClick={onClick} data-testid="button">
      {children}
    </button>
  );
};

export default Button;
