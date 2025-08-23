import React from 'react';
import { FiPlusCircle } from 'react-icons/fi';
import QuestionField from './QuestionField';

function FormBuilder({ questions, setQuestions }) {
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', type: 'short_text', is_required: false, options: [], image: null, max_choices: '' },
    ]);
  };

  const updateQuestion = (index, updated) => {
    const next = [...questions];
    next[index] = updated;
    setQuestions(next);
  };

  const removeQuestion = (index) => {
    const next = [...questions];
    next.splice(index, 1);
    setQuestions(next);
  };

  return (
    <div>
      {(!questions || questions.filter(Boolean).length === 0) && (
        <p className="forms-empty">Još nema pitanja. Dodaj prvo pitanje.</p>
      )}

      <div className="form-question-list">
        {questions
          .filter(Boolean)
          .map((q, i) => (
            <div key={i} className="form-question">
              <QuestionField
                index={i}
                question={q}
                updateQuestion={updateQuestion}
                removeQuestion={removeQuestion}
              />
            </div>
          ))}
      </div>

      <div className="actions-col">
        <button type="button" className="form-button" onClick={addQuestion}>
          <FiPlusCircle />
          Dodaj pitanje
        </button>
      </div>
    </div>
  );
}

export default FormBuilder;
