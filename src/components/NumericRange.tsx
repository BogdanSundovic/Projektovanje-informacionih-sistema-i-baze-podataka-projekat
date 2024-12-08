import React from 'react';
import { NumericRange as NumericRangeType } from '../types/form';

interface NumericRangeProps {
  value: NumericRangeType;
  onChange: (range: NumericRangeType) => void;
}

export default function NumericRange({ value, onChange }: NumericRangeProps) {
  const handleChange = (field: keyof NumericRangeType, newValue: number) => {
    onChange({
      ...value,
      [field]: newValue,
    });
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Min</label>
        <input
          type="number"
          value={value.min}
          onChange={(e) => handleChange('min', parseInt(e.target.value) || 0)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Max</label>
        <input
          type="number"
          value={value.max}
          onChange={(e) => handleChange('max', parseInt(e.target.value) || 100)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Step</label>
        <input
          type="number"
          value={value.step}
          onChange={(e) => handleChange('step', parseInt(e.target.value) || 1)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}