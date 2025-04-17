import React from 'react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-gray-300'
        }`} />
        <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
          checked ? 'transform translate-x-5' : ''
        }`} />
      </div>
      <span className="ml-3 text-sm font-medium text-gray-700">{label}</span>
    </label>
  );
};

export default Toggle;