export type QuestionType = 
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'numeric'
  | 'date'
  | 'time';

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options?: string[];
  imageUrl?: string;
  numericRange?: {
    min: number;
    max: number;
    step: number;
  };
  maxChoices?: number;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  allowAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}