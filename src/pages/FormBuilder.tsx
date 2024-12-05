import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Save } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import DraggableQuestion from '../components/DraggableQuestion';
import { useFormStore } from '../stores/formStore';
import { Question } from '../types/form';

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!currentForm) {
    return null;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = currentForm.questions.findIndex((q) => q.id === active.id);
      const newIndex = currentForm.questions.findIndex((q) => q.id === over.id);
      reorderQuestions(currentForm.id, oldIndex, newIndex);
    }
  };

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
    if (!currentForm.title.trim()) {
      alert('Form title is required');
      return;
    }
    if (currentForm.questions.length === 0) {
      alert('Form must have at least one question');
      return;
    }
    updateForm(currentForm.id, {
      updatedAt: new Date().toISOString(),
    });
    // In a real app, we would save to a backend here
    alert('Form saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={currentForm.title}
            onChange={(e) =>
              updateForm(currentForm.id, { title: e.target.value })
            }
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
          value={currentForm.description}
          onChange={(e) =>
            updateForm(currentForm.id, { description: e.target.value })
          }
          placeholder="Form Description"
          className="w-full border-none focus:ring-0 resize-none"
          rows={3}
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={currentForm.questions.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {currentForm.questions.map((question) => (
              <DraggableQuestion
                key={question.id}
                question={question}
                onUpdate={(updates) =>
                  updateQuestion(currentForm.id, question.id, updates)
                }
                onDelete={() => removeQuestion(currentForm.id, question.id)}
                onClone={() => {
                  const clone = {
                    ...question,
                    id: `q-${Date.now()}`,
                    title: `${question.title} (Copy)`,
                  };
                  addQuestion(currentForm.id, clone);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={handleAddQuestion}
        className="mt-4 flex items-center space-x-2 text-indigo-600 hover:text-indigo-700"
      >
        <Plus className="h-5 w-5" />
        <span>Add Question</span>
      </button>
    </div>
  );
}