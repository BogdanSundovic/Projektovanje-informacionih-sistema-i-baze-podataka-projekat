import React from 'react';
import { Save } from 'lucide-react';
import { Form } from '../types/form';

interface FormHeaderProps {
  form: Form;
  onUpdate: (updates: Partial<Form>) => void;
  onSave: () => void;
}

export default function FormHeader({ form, onUpdate, onSave }: FormHeaderProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          value={form.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="text-2xl font-bold w-full border-none focus:ring-0"
          placeholder="Form Title"
        />
        <button
          onClick={onSave}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <Save className="h-5 w-5" />
          <span>Save</span>
        </button>
      </div>
      <textarea
        value={form.description}
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Form Description"
        className="w-full border-none focus:ring-0 resize-none"
        rows={3}
      />
    </div>
  );
}