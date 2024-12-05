import React from 'react';
import { Question, QuestionType, NumericRange } from '../types/form';
import { Trash2, Image, Copy, GripVertical } from 'lucide-react';
import NumericRangeComponent from './NumericRange';

interface QuestionEditorProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onClone: () => void;
  dragHandleProps?: Record<string, any>;
}

export default function QuestionEditor({
  question,
  onUpdate,
  onDelete,
  onClone,
  dragHandleProps,
}: QuestionEditorProps) {
  const questionTypes: { value: QuestionType; label: string }[] = [
    { value: 'short_text', label: 'Short Text (512 chars)' },
    { value: 'long_text', label: 'Long Text (4096 chars)' },
    { value: 'single_choice', label: 'Single Choice' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'numeric', label: 'Numeric' },
    { value: 'date', label: 'Date' },
    { value: 'time', label: 'Time' },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div {...dragHandleProps}>
            <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
          </div>
          <select
            value={question.type}
            onChange={(e) => onUpdate({ type: e.target.value as QuestionType })}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {questionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onClone}
            className="text-gray-600 hover:text-gray-700"
            title="Clone question"
          >
            <Copy className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
            title="Delete question"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <input
        type="text"
        value={question.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Question text"
        className="w-full mb-4 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />

      {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
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
      )}

      {question.type === 'numeric' && (
        <NumericRangeComponent
          value={question.numericRange}
          onChange={(range: NumericRange) => onUpdate({ numericRange: range })}
        />
      )}

      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Required</span>
        </label>

        <button
          onClick={() => {
            const imageUrl = prompt('Enter image URL:');
            if (imageUrl) {
              onUpdate({ imageUrl });
            }
          }}
          className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
        >
          <Image className="h-4 w-4" />
          <span className="text-sm">Add Image</span>
        </button>
      </div>

      {question.imageUrl && (
        <div className="mt-4">
          <img
            src={question.imageUrl}
            alt="Question illustration"
            className="max-w-full h-auto rounded-md"
          />
          <button
            onClick={() => onUpdate({ imageUrl: undefined })}
            className="mt-2 text-red-600 hover:text-red-700 text-sm"
          >
            Remove Image
          </button>
        </div>
      )}
    </div>
  );
}