import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import QuestionEditor from './QuestionEditor';
import { Question } from '../types/form';

interface DraggableQuestionProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onClone: () => void;
}

export default function DraggableQuestion({
  question,
  onUpdate,
  onDelete,
  onClone,
}: DraggableQuestionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <QuestionEditor
        question={question}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClone={onClone}
        dragHandleProps={listeners}
      />
    </div>
  );
}