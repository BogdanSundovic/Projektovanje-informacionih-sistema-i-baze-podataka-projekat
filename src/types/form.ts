export type QuestionType = 
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'numeric'
  | 'date'
  | 'time';

export interface NumericRange {
  min: number;
  max: number;
  step: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options?: string[];
  maxChoices?: number;
  numericRange?: NumericRange;
  imageUrl?: string;
}

export interface Form {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  allowAnonymous?: boolean;
  createdAt: string;
  updatedAt: string;
}