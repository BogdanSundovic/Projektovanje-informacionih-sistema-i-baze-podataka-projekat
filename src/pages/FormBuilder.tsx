import React, { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import QuestionEditor from '../components/QuestionEditor';
import { Question } from '../types/form';

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

  const cloneQuestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const clone = {
        ...question,
        id: `q-${Date.now()}`,
        title: `${question.title} (Copy)`
      };
      setQuestions([...questions, clone]);
    }
  };

  const handleSave = () => {
    // Still intentionally buggy - will be fixed in later stages
    console.log('Saving form...');
    if (!title.trim()) {
      alert('Form title is required');
      return;
    }
    if (questions.length === 0) {
      alert('Form must have at least one question');
      return;
    }
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
          <QuestionEditor
            key={question.id}
            question={question}
            onUpdate={(updates) => updateQuestion(question.id, updates)}
            onDelete={() => deleteQuestion(question.id)}
            onClone={() => cloneQuestion(question.id)}
          />
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