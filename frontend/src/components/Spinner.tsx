import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', text }) => {
  return (
    <div className={`spinner-container spinner-container--${size}`}>
      <div className={`spinner spinner--${size}`}></div>
      {text && <div className="spinner-text">{text}</div>}
    </div>
  );
};