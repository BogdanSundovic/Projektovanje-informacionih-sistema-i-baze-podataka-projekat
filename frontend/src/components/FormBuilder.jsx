// src/components/FormBuilder.jsx

import React from 'react';
import QuestionField from './QuestionField';

function FormBuilder({ questions, setQuestions }) {
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', type: 'text', is_required: false, options: [] },
    ]);
  };

  const updateQuestion = (index, updated) => {
    const newQuestions = [...questions];
    newQuestions[index] = updated;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  return (
    <div>
      <h3>Pitanja</h3>
      {questions.map((q, i) => (
        <QuestionField
          key={i}
          index={i}
          question={q}
          updateQuestion={updateQuestion}
          removeQuestion={removeQuestion}
        />
      ))}

      <button onClick={addQuestion}>+ Dodaj pitanje</button>
    </div>
  );
}

export default FormBuilder;
