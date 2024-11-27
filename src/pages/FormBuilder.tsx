import React, { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { Question, QuestionType } from '../types/form';

export default function FormBuilder() {
  const [title, setTitle] = useState('Untitled Form');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'short_text',
      title: 'New Question',
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleSave = () => {
    // Intentionally buggy save function - will be fixed in later stages
    console.log('Saving form...');
    setTimeout(() => {
      console.error('Failed to save form');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-bold w-full border-none focus:ring-0"
            placeholder="Form Title"
          />
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            <Save className="h-5 w-5" />
            <span>Save</span>
          </button>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Form Description"
          className="w-full border-none focus:ring-0 resize-none"
          rows={3}
        />
      </div>

      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between mb-4">
              <select
                value={question.type}
                onChange={(e) => updateQuestion(question.id, { type: e.target.value as QuestionType })}
                className="rounded-md border-gray-300"
              >
                <option value="short_text">Short Text</option>
                <option value="long_text">Long Text</option>
                <option value="single_choice">Single Choice</option>
              </select>
              <button
                onClick={() => deleteQuestion(question.id)}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
            <input
              type="text"
              value={question.title}
              onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
              placeholder="Question text"
              className="w-full mb-4 rounded-md border-gray-300"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="text-sm text-gray-700">Required</span>
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={addQuestion}
        className="mt-4 flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
      >
        <Plus className="h-5 w-5" />
        <span>Add Question</span>
      </button>
    </div>
  );
}