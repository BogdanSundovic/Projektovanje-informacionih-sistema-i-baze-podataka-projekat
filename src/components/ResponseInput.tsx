import React from 'react';
import { Question } from '../types/form';

interface ResponseInputProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export default function ResponseInput({ question, value, onChange }: ResponseInputProps) {
  switch (question.type) {
    case 'short_text':
    case 'long_text':
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          maxLength={question.type === 'short_text' ? 512 : 4096}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      );

    case 'single_choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="radio"
                checked={value === option}
                onChange={() => onChange(option)}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );

    case 'multiple_choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(option)}
                onChange={(e) => {
                  const currentValue = Array.isArray(value) ? value : [];
                  if (e.target.checked) {
                    onChange([...currentValue, option]);
                  } else {
                    onChange(currentValue.filter((v) => v !== option));
                  }
                }}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );

    case 'numeric':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          min={question.numericRange?.min}
          max={question.numericRange?.max}
          step={question.numericRange?.step}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      );

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      );

    case 'time':
      return (
        <input
          type="time"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      );

    default:
      return null;
  }
}