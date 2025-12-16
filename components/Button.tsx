import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex justify-center items-center shadow-sm active:scale-95";
  
  const variants = {
    primary: "bg-red-600 text-white hover:bg-red-700 shadow-red-200",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50",
    outline: "bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-50",
    danger: "bg-red-100 text-red-700 hover:bg-red-200"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;