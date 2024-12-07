import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useFormStore } from '../stores/formStore';
import { Question } from '../types/form';
import FormHeader from '../components/FormHeader';
import QuestionList from '../components/QuestionList';
import { validateForm, ValidationError } from '../utils/formValidation';

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const {
    currentForm,
    setCurrentForm,
    createForm,
    updateForm,
    addQuestion,
    removeQuestion,
    updateQuestion,
    reorderQuestions,
  } = useFormStore();

  useEffect(() => {
    if (id === 'new') {
      const newForm = {
        id: `form-${Date.now()}`,
        title: 'Untitled Form',
        description: '',
        questions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      createForm(newForm);
      setCurrentForm(newForm);
      navigate(`/forms/${newForm.id}/edit`, { replace: true });
    } else if (id && !currentForm) {
      // In a real app, we would fetch the form data here
      navigate('/forms/new');
    }
  }, [id, currentForm, createForm, navigate, setCurrentForm]);

  if (!currentForm) {
    return null;
  }

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'short_text',
      title: 'New Question',
      required: false,
    };
    addQuestion(currentForm.id, newQuestion);
  };

  const handleSave = () => {
    const errors = validateForm(currentForm);
    setValidationErrors(errors);

    if (errors.length > 0) {
      const errorMessages = errors.map((error) => error.message);
      alert(`Please fix the following errors:\n\n${errorMessages.join('\n')}`);
      return;
    }

    updateForm(currentForm.id, {
      updatedAt: new Date().toISOString(),
    });
    alert('Form saved successfully!');
  };

  const handleCloneQuestion = (question: Question) => {
    const clone = {
      ...question,
      id: `q-${Date.now()}`,
      title: `${question.title} (Copy)`,
    };
    addQuestion(currentForm.id, clone);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <FormHeader
        form={currentForm}
        onUpdate={(updates) => updateForm(currentForm.id, updates)}
        onSave={handleSave}
      />

      <QuestionList
        questions={currentForm.questions}
        onReorder={(startIndex, endIndex) =>
          reorderQuestions(currentForm.id, startIndex, endIndex)
        }
        onUpdate={(questionId, updates) =>
          updateQuestion(currentForm.id, questionId, updates)
        }
        onDelete={(questionId) => removeQuestion(currentForm.id, questionId)}
        onClone={handleCloneQuestion}
      />

      <button
        onClick={handleAddQuestion}
        className="mt-4 flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
      >
        <Plus className="h-5 w-5" />
        <span>Add Question</span>
      </button>

      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 rounded-md">
          <h3 className="text-sm font-medium text-red-800">
            Please fix the following errors:
          </h3>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}