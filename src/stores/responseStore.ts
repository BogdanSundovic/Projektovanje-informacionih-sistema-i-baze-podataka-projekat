import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FormResponse } from '../types/response';

interface ResponseState {
  responses: FormResponse[];
  addResponse: (response: FormResponse) => void;
  getResponsesByFormId: (formId: string) => FormResponse[];
}

export const useResponseStore = create<ResponseState>()(
  persist(
    (set, get) => ({
      responses: [],
      addResponse: (response) =>
        set((state) => ({
          responses: [...state.responses, response],
        })),
      getResponsesByFormId: (formId) =>
        get().responses.filter((response) => response.formId === formId),
    }),
    {
      name: 'form-responses',
    }
  )
);