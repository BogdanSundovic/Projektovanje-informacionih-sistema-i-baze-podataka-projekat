import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Share2, Lock, Users, Save } from 'lucide-react';
import QuestionEditor from '../components/QuestionEditor';
import { useFormStore } from '../stores/formStore';
import { Question, QuestionType } from '../types/form';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('Untitled Form');
  const [description, setDescription] = useState('');
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showCollaborators, setShowCollaborators] = useState(false);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type: 'short_text',
      title: 'New Question',
      required: false,
      options: [],
      numericRange: { min: 0, max: 100, step: 1 }
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
    const questionToClone = questions.find(q => q.id === questionId);
    if (questionToClone) {
      const clonedQuestion = {
        ...questionToClone,
        id: `q-${Date.now()}`,
        title: `${questionToClone.title} (Copy)`
      };
      setQuestions([...questions, clonedQuestion]);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(questions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQuestions(items);
  };

  const handleSave = () => {
    // Save form logic here
    console.log({
      title,
      description,
      allowAnonymous,
      isLocked,
      questions
    });
  };

  const shareForm = () => {
    const shareUrl = `${window.location.origin}/forms/${id}/respond`;
    navigator.clipboard.writeText(shareUrl);
    alert('Form link copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Form Header */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Form Title"
            className="text-2xl font-bold w-full border-none focus:ring-0 p-0"
          />
          <div className="flex space-x-2">
            <button
              onClick={shareForm}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Share form"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`p-2 ${isLocked ? 'text-red-600' : 'text-gray-600'} hover:text-gray-900`}
              title={isLocked ? 'Unlock form' : 'Lock form'}
            >
              <Lock className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowCollaborators(true)}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Manage collaborators"
            >
              <Users className="h-5 w-5" />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              <Save className="h-5 w-5" />
              <span>Save</span>
            </button>
          </div>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Form Description"
          className="w-full border-none focus:ring-0 p-0 resize-none mb-4"
          rows={3}
        />
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="allowAnonymous"
            checked={allowAnonymous}
            onChange={(e) => setAllowAnonymous(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="allowAnonymous" className="text-sm text-gray-700">
            Allow anonymous responses
          </label>
        </div>
      </div>

      {/* Questions List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="questions">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {questions.map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <QuestionEditor
                        question={question}
                        onUpdate={(updates) => updateQuestion(question.id, updates)}
                        onDelete={() => deleteQuestion(question.id)}
                        onClone={() => cloneQuestion(question.id)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Question Button */}
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