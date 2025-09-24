// src/components/FormBuilder.jsx

import React from 'react';
import { FiPlusCircle, FiCopy, FiArrowUp, FiArrowDown, FiTrash2 } from 'react-icons/fi';

import QuestionField from './QuestionField';

function FormBuilder({ questions, setQuestions }) {
  const addQuestion = () => {
    setQuestions([
      ...questions,
 FrontEnd2
      { text: '', type: 'short_text', is_required: false, options: [] },

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

  const duplicateQuestion = (index) => {
    const src = questions[index];
    if (!src) return;
    const clone = {
      ...src,
      id: undefined, // novi entitet
      // zadrži image reference (File/url), resetuj id-eve opcija
      options: (src.options || []).map((o) => ({
        ...o,
        id: undefined,
      })),
    };
    const next = [...questions.slice(0, index + 1), clone, ...questions.slice(index + 1)];
    setQuestions(next);
  };

  const moveQuestion = (index, dir) => {
    const delta = dir === 'up' ? -1 : 1;
    const newIdx = index + delta;
    if (newIdx < 0 || newIdx >= questions.length) return;
    const next = [...questions];
    [next[index], next[newIdx]] = [next[newIdx], next[index]];
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
              {/* Toolbar za svako pitanje */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                marginBottom: 8
              }}>
                <button
                  type="button"
                  className="btn-ghost"
                  title="Dupliraj pitanje"
                  onClick={() => duplicateQuestion(i)}
                >
                  <FiCopy style={{ verticalAlign: 'middle' }} /> Dupliraj
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  title="Pomeri gore"
                  onClick={() => moveQuestion(i, 'up')}
                >
                  <FiArrowUp style={{ verticalAlign: 'middle' }} /> Gore
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  title="Pomeri dole"
                  onClick={() => moveQuestion(i, 'down')}
                >
                  <FiArrowDown style={{ verticalAlign: 'middle' }} /> Dole
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  title="Ukloni pitanje"
                  onClick={() => removeQuestion(i)}
                >
                  <FiTrash2 style={{ verticalAlign: 'middle' }} /> Ukloni
                </button>
              </div>

              <QuestionField
                index={i}
                question={q}
                updateQuestion={updateQuestion}
                removeQuestion={removeQuestion}
                hideRemoveButton     // da ne dupliramo "Ukloni pitanje"
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
