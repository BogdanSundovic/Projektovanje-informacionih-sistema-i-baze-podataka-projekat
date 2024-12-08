import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormStore } from '../stores/formStore';
import { useResponseStore } from '../stores/responseStore';
import { useAuthStore } from '../stores/authStore';
import ResponseInput from '../components/ResponseInput';
import { QuestionResponse } from '../types/response';
import { AlertCircle } from 'lucide-react';

export default function FormResponse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const form = useFormStore((state) => 
    state.forms.find((f) => f.id === id)
  );
  const addResponse = useResponseStore((state) => state.addResponse);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<string[]>([]);

  if (!form) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Form not found</h2>
        <p className="mt-2 text-gray-600">The form you're looking for doesn't exist.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    // Validate required questions
    form.questions.forEach((question) => {
      if (question.required && !responses[question.id]) {
        newErrors.push(`Question "${question.title}" is required`);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const formattedResponses: QuestionResponse[] = Object.entries(responses).map(
      ([questionId, value]) => ({
        questionId,
        value,
      })
    );

    const formResponse = {
      id: `response-${Date.now()}`,
      formId: form.id,
      responses: formattedResponses,
      submittedAt: new Date().toISOString(),
      submittedBy: user?.email,
    };

    addResponse(formResponse);
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
        <p className="text-gray-600 mb-6">{form.description}</p>

        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Please fix the following errors:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {form.questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block">
                <span className="text-gray-700 font-medium">
                  {question.title}
                  {question.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </span>
                <ResponseInput
                  question={question}
                  value={responses[question.id]}
                  onChange={(value) =>
                    setResponses((prev) => ({
                      ...prev,
                      [question.id]: value,
                    }))
                  }
                />
              </label>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}