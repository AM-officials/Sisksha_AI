import React from 'react';

interface MascotProps {
  expression?: 'happy' | 'thinking' | 'excited' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animate?: boolean;
  onClick?: () => void;
}

const Mascot: React.FC<MascotProps> = ({ 
  expression = 'happy', 
  size = 'md', 
  className = '',
  animate = true,
  onClick
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };
  
  const animationClass = animate ? 'animate-bounce-subtle' : '';
  
  // Different face expressions
  const expressions = {
    happy: (
      <div className="mascot-face flex flex-col items-center">
        <div className="mascot-eyes flex space-x-2">
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
        </div>
        <div className="mascot-mouth w-8 h-4 mt-2 bg-white rounded-full flex items-center justify-center">
          <div className="w-6 h-2 bg-siksha-purple rounded-full"></div>
        </div>
      </div>
    ),
    thinking: (
      <div className="mascot-face flex flex-col items-center">
        <div className="mascot-eyes flex space-x-2">
          <div className="w-3 h-4 bg-white rounded-full"></div>
          <div className="w-4 h-3 bg-white rounded-full mt-1"></div>
        </div>
        <div className="mascot-mouth w-6 h-2 mt-2 bg-white rounded-full"></div>
      </div>
    ),
    excited: (
      <div className="mascot-face flex flex-col items-center">
        <div className="mascot-eyes flex space-x-2">
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
        </div>
        <div className="mascot-mouth w-8 h-6 mt-1 bg-white rounded-full flex items-center justify-center">
          <div className="w-6 h-4 bg-siksha-pink rounded-full"></div>
        </div>
      </div>
    ),
    neutral: (
      <div className="mascot-face flex flex-col items-center">
        <div className="mascot-eyes flex space-x-2">
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
        </div>
        <div className="mascot-mouth w-6 h-1 mt-2 bg-white rounded-full"></div>
      </div>
    ),
  };

  return (
    <div
      className={`${sizeClasses[size]} ${animationClass} ${className} cursor-pointer`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'Open Mentor Chat' : undefined}
    >
      <div className="mascot-container relative w-full h-full">
        <div className="mascot-head w-full h-full bg-siksha-purple rounded-full flex items-center justify-center shadow-lg">
          <div className="mascot-antenna absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="w-2 h-5 bg-siksha-purple-dark"></div>
            <div className="w-4 h-4 rounded-full bg-siksha-yellow absolute -top-2 left-1/2 transform -translate-x-1/2"></div>
          </div>
          {expressions[expression]}
        </div>
      </div>
    </div>
  );
};

export default Mascot;
