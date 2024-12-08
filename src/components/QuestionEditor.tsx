import React from 'react';
import { Question, QuestionType } from '../types/form';
import { Trash2, Copy, GripVertical } from 'lucide-react';
import NumericRange from './NumericRange';
import QuestionOptions from './QuestionOptions';
import ImageUpload from './ImageUpload';

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
        <QuestionOptions question={question} onUpdate={onUpdate} />
      )}

      {question.type === 'numeric' && (
        <NumericRange
          value={question.numericRange || { min: 0, max: 100, step: 1 }}
          onChange={(range) => onUpdate({ numericRange: range })}
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

        <ImageUpload
          imageUrl={question.imageUrl}
          onUpdate={(imageUrl) => onUpdate({ imageUrl })}
        />
      </div>
    </div>
  );
}