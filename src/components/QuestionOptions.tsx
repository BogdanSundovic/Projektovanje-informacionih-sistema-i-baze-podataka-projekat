import React from 'react';
import { Question } from '../types/form';
import { Trash2 } from 'lucide-react';

interface QuestionOptionsProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
}

export default function QuestionOptions({ question, onUpdate }: QuestionOptionsProps) {
  return (
    <div className="space-y-2">
      {question.options?.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
            disabled
            className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <input
            type="text"
            value={option}
            onChange={(e) => {
              const newOptions = [...(question.options || [])];
              newOptions[index] = e.target.value;
              onUpdate({ options: newOptions });
            }}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder={`Option ${index + 1}`}
          />
          <button
            onClick={() => {
              const newOptions = question.options?.filter((_, i) => i !== index);
              onUpdate({ options: newOptions });
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        onClick={() => {
          const newOptions = [...(question.options || []), ''];
          onUpdate({ options: newOptions });
        }}
        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
      >
        Add Option
      </button>
      {question.type === 'multiple_choice' && (
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700">
            Required number of answers:
          </label>
          <input
            type="number"
            min="1"
            max={question.options?.length || 1}
            value={question.maxChoices || 1}
            onChange={(e) => onUpdate({ maxChoices: parseInt(e.target.value) })}
            className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  );
}