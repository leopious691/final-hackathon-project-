import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">{label}</label>
      <input
        className={`w-full px-4 py-3 rounded-xl border text-black ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'} focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition-all ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
};

export default Input;