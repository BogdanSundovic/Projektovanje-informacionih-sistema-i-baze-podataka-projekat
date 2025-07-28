// src/components/FormBuilder.jsx
import { FiPlusCircle } from 'react-icons/fi';
import React from 'react';
import QuestionField from './QuestionField';

function FormBuilder({ questions, setQuestions }) {
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: '', type: 'short_text', is_required: false, options: [] },
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
      <h3 className="forms-title">Pitanja</h3>
      <div className="form-question-list"></div>
      {questions.map((q, i) => (
        <div key={i} className="form-question">
        <QuestionField
          index={i}
          question={q}
          updateQuestion={updateQuestion}
          removeQuestion={removeQuestion}
        />
        </div>
      ))}
      <div>
      <button className="form-button" onClick={addQuestion}>
        <FiPlusCircle style={{ marginRight: '8px' }} />
        + Dodaj pitanje</button>
      </div>
    </div>
  );
}

export default FormBuilder;
