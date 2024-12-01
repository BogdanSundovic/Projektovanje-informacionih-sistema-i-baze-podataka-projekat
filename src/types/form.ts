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
  maxChoices?: number;
  numericRange?: {
    min: number;
    max: number;
    step: number;
  };
  imageUrl?: string;
}