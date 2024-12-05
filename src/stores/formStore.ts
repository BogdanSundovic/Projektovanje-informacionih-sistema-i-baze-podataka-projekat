import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Form, Question } from '../types/form';

interface FormState {
  forms: Form[];
  currentForm: Form | null;
  setCurrentForm: (form: Form) => void;
  updateForm: (formId: string, updates: Partial<Form>) => void;
  createForm: (form: Form) => void;
  deleteForm: (formId: string) => void;
  updateQuestion: (formId: string, questionId: string, updates: Partial<Question>) => void;
  addQuestion: (formId: string, question: Question) => void;
  removeQuestion: (formId: string, questionId: string) => void;
  reorderQuestions: (formId: string, startIndex: number, endIndex: number) => void;
}

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      forms: [],
      currentForm: null,
      setCurrentForm: (form) => set({ currentForm: form }),
      updateForm: (formId, updates) =>
        set((state) => ({
          forms: state.forms.map((f) =>
            f.id === formId ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
          ),
          currentForm:
            state.currentForm?.id === formId
              ? { ...state.currentForm, ...updates, updatedAt: new Date().toISOString() }
              : state.currentForm,
        })),
      createForm: (form) =>
        set((state) => ({
          forms: [...state.forms, form],
          currentForm: form,
        })),
      deleteForm: (formId) =>
        set((state) => ({
          forms: state.forms.filter((f) => f.id !== formId),
          currentForm: state.currentForm?.id === formId ? null : state.currentForm,
        })),
      updateQuestion: (formId, questionId, updates) =>
        set((state) => ({
          forms: state.forms.map((f) =>
            f.id === formId
              ? {
                  ...f,
                  questions: f.questions.map((q) =>
                    q.id === questionId ? { ...q, ...updates } : q
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
          currentForm:
            state.currentForm?.id === formId
              ? {
                  ...state.currentForm,
                  questions: state.currentForm.questions.map((q) =>
                    q.id === questionId ? { ...q, ...updates } : q
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : state.currentForm,
        })),
      addQuestion: (formId, question) =>
        set((state) => ({
          forms: state.forms.map((f) =>
            f.id === formId
              ? {
                  ...f,
                  questions: [...f.questions, question],
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
          currentForm:
            state.currentForm?.id === formId
              ? {
                  ...state.currentForm,
                  questions: [...state.currentForm.questions, question],
                  updatedAt: new Date().toISOString(),
                }
              : state.currentForm,
        })),
      removeQuestion: (formId, questionId) =>
        set((state) => ({
          forms: state.forms.map((f) =>
            f.id === formId
              ? {
                  ...f,
                  questions: f.questions.filter((q) => q.id !== questionId),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
          currentForm:
            state.currentForm?.id === formId
              ? {
                  ...state.currentForm,
                  questions: state.currentForm.questions.filter((q) => q.id !== questionId),
                  updatedAt: new Date().toISOString(),
                }
              : state.currentForm,
        })),
      reorderQuestions: (formId, startIndex, endIndex) =>
        set((state) => {
          const form = state.forms.find((f) => f.id === formId);
          if (!form) return state;

          const newQuestions = [...form.questions];
          const [removed] = newQuestions.splice(startIndex, 1);
          newQuestions.splice(endIndex, 0, removed);

          return {
            forms: state.forms.map((f) =>
              f.id === formId
                ? { ...f, questions: newQuestions, updatedAt: new Date().toISOString() }
                : f
            ),
            currentForm:
              state.currentForm?.id === formId
                ? { ...state.currentForm, questions: newQuestions, updatedAt: new Date().toISOString() }
                : state.currentForm,
          };
        }),
    }),
    {
      name: 'form-storage',
    }
  )
);