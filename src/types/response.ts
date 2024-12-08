export interface QuestionResponse {
    questionId: string;
    value: string | string[] | number | Date;
  }
  
  export interface FormResponse {
    id: string;
    formId: string;
    responses: QuestionResponse[];
    submittedAt: string;
    submittedBy?: string;
  }