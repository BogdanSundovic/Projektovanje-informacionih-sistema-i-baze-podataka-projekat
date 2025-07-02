// src/components/QuestionField.jsx

import React, { useState } from 'react';

function QuestionField({ index, question, updateQuestion, removeQuestion }) {
  const [localQ, setLocalQ] = useState(question);

  const handleChange = (field, value) => {
    const updated = { ...localQ, [field]: value };
    setLocalQ(updated);
    updateQuestion(index, updated);
  };

  return (
    <div className="question-block">
      <input
        type="text"
        placeholder="Tekst pitanja"
        value={localQ.text}
        onChange={(e) => handleChange('text', e.target.value)}
      />

      <select
        value={localQ.type}
        onChange={(e) => handleChange('type', e.target.value)}
      >
        <option value="text">Tekst</option>
        <option value="radio">Jedan izbor</option>
        <option value="checkbox">Više izbora</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={localQ.is_required}
          onChange={(e) => handleChange('is_required', e.target.checked)}
        />
        Obavezno
      </label>

      {['radio', 'checkbox'].includes(localQ.type) && (
        <textarea
          placeholder="Opcije (jedna po liniji)"
          value={localQ.options?.join('\n') || ''}
          onChange={(e) =>
            handleChange('options', e.target.value.split('\n'))
          }
        />
      )}

      <button onClick={() => removeQuestion(index)}>Ukloni</button>
    </div>
  );
}

export default QuestionField;
