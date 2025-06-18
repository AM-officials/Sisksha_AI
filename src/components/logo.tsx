import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`bg-siksha-purple rounded-md flex items-center justify-center text-white font-bold ${className || ''}`}>
      S
    </div>
  );
}; 