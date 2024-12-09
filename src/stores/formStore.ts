import { create } from 'zustand';
import { Form, Question } from '../types/form';

interface FormState {
  currentForm: Form | null;
  setCurrentForm: (form: Form) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  addQuestion: (question: Question) => void;
  removeQuestion: (questionId: string) => void;
  reorderQuestions: (startIndex: number, endIndex: number) => void;
}

const defaultForm: Form = {
  id: '',
  title: 'Untitled Form',
  description: '',
  questions: [],
  allowAnonymous: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const useFormStore = create<FormState>((set) => ({
  currentForm: null,
  setCurrentForm: (form) => set({ currentForm: form }),
  updateQuestion: (questionId, updates) =>
    set((state) => ({
      currentForm: state.currentForm
        ? {
            ...state.currentForm,
            questions: state.currentForm.questions.map((q) =>
              q.id === questionId ? { ...q, ...updates } : q
            ),
          }
        : null,
    })),
  addQuestion: (question) =>
    set((state) => ({
      currentForm: state.currentForm
        ? {
            ...state.currentForm,
            questions: [...state.currentForm.questions, question],
          }
        : null,
    })),
  removeQuestion: (questionId) =>
    set((state) => ({
      currentForm: state.currentForm
        ? {
            ...state.currentForm,
            questions: state.currentForm.questions.filter((q) => q.id !== questionId),
          }
        : null,
    })),
  reorderQuestions: (startIndex, endIndex) =>
    set((state) => {
      if (!state.currentForm) return state;
      const questions = [...state.currentForm.questions];
      const [removed] = questions.splice(startIndex, 1);
      questions.splice(endIndex, 0, removed);
      return {
        currentForm: {
          ...state.currentForm,
          questions,
        },
      };
    }),
}));