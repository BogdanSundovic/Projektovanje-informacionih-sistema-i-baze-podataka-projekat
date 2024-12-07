import { Form, Question } from '../types/form';

export interface ValidationError {
  field: string;
  message: string;
}

export function validateForm(form: Form): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate form title
  if (!form.title.trim()) {
    errors.push({
      field: 'title',
      message: 'Form title is required',
    });
  }

  // Validate questions
  if (form.questions.length === 0) {
    errors.push({
      field: 'questions',
      message: 'Form must have at least one question',
    });
  }

  // Validate each question
  form.questions.forEach((question, index) => {
    const questionErrors = validateQuestion(question);
    questionErrors.forEach((error) => {
      errors.push({
        field: `questions[${index}].${error.field}`,
        message: error.message,
      });
    });
  });

  return errors;
}

export function validateQuestion(question: Question): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!question.title.trim()) {
    errors.push({
      field: 'title',
      message: 'Question title is required',
    });
  }

  if (
    (question.type === 'single_choice' || question.type === 'multiple_choice') &&
    (!question.options || question.options.length < 2)
  ) {
    errors.push({
      field: 'options',
      message: 'At least two options are required',
    });
  }

  if (question.type === 'numeric' && question.numericRange) {
    const { min, max, step } = question.numericRange;
    if (min >= max) {
      errors.push({
        field: 'numericRange',
        message: 'Maximum value must be greater than minimum value',
      });
    }
    if (step <= 0) {
      errors.push({
        field: 'numericRange',
        message: 'Step must be greater than 0',
      });
    }
  }

  return errors;
}