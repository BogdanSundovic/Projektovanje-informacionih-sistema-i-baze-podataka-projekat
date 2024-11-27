export type QuestionType = 
  | 'short_text'
  | 'long_text'
  | 'single_choice';

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  required: boolean;
  options?: string[];
}