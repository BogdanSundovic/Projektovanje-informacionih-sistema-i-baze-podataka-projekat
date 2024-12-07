import React from 'react';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import DraggableQuestion from './DraggableQuestion';
import { Question } from '../types/form';

interface QuestionListProps {
  questions: Question[];
  onReorder: (startIndex: number, endIndex: number) => void;
  onUpdate: (questionId: string, updates: Partial<Question>) => void;
  onDelete: (questionId: string) => void;
  onClone: (question: Question) => void;
}

export default function QuestionList({
  questions,
  onReorder,
  onUpdate,
  onDelete,
  onClone,
}: QuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={questions.map((q) => q.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {questions.map((question) => (
            <DraggableQuestion
              key={question.id}
              question={question}
              onUpdate={(updates) => onUpdate(question.id, updates)}
              onDelete={() => onDelete(question.id)}
              onClone={() => onClone(question)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}