// src/components/QuestionField.jsx

import React, { useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';

function QuestionField({ index, question, updateQuestion, removeQuestion }) {
  const [localQ, setLocalQ] = useState(question);

  useEffect(() => {
    if (['radio', 'checkbox'].includes(localQ.type) && Array.isArray(localQ.options)) {
      const normalizedOptions = localQ.options.map((opt) =>
        typeof opt === 'string' ? { text: opt, image: null } : opt
      );
      setLocalQ((prev) => ({ ...prev, options: normalizedOptions }));
    }
  }, [localQ.type]);

  const handleChange = (field, value) => {
    const updated = { ...localQ, [field]: value };
    setLocalQ(updated);
    updateQuestion(index, updated);
  };

  const handleOptionChange = (i, key, value) => {
    const updatedOptions = [...(localQ.options || [])];
    if (!updatedOptions[i]) updatedOptions[i] = { text: '', image: null };
    updatedOptions[i][key] = value;
    handleChange('options', updatedOptions);
  };

  const addOption = () => {
    handleChange('options', [...(localQ.options || []), { text: '', image: null }]);
  };

  const removeOption = (i) => {
    const updatedOptions = [...(localQ.options || [])];
    updatedOptions.splice(i, 1);
    handleChange('options', updatedOptions);
  };

  return (
    <div className="question-block">
      <input
        type="text"
        placeholder="Tekst pitanja"
        value={localQ.text}
        onChange={(e) => handleChange('text', e.target.value)}
        className="input-field"
      />

      <input
        type="file"
        accept="image/*"
        className="input-field"
        onChange={(e) => handleChange('image', e.target.files[0])}
      />

      <select
        className="input-field"
        value={localQ.type}
        onChange={(e) => handleChange('type', e.target.value)}
      >
        <option value="short_text">Kratak tekst (do 512 karaktera)</option>
        <option value="long_text">Dug tekst (do 4096 karaktera)</option>
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
        <>
          {(localQ.options || []).map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
              <input
                type="text"
                value={opt.text}
                placeholder={`Opcija ${i + 1}`}
                onChange={(e) => handleOptionChange(i, 'text', e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleOptionChange(i, 'image', e.target.files[0])}
              />
              <button type="button" onClick={() => removeOption(i)}>X</button>
            </div>
          ))}
          <button type="button" className="form-button" onClick={addOption}>
            Dodaj opciju
          </button>
        </>
      )}

      {localQ.type === 'checkbox' && (
        <input
          type="number"
          className="input-field"
          placeholder="Broj dozvoljenih odgovora (opcionalno)"
          value={localQ.max_choices || ''}
          min={1}
          onChange={(e) => handleChange('max_choices', Number(e.target.value))}
        />
      )}

      <button className="form-button" onClick={() => removeQuestion(index)}>
        <FiTrash2 style={{ marginRight: '6px' }} />
        Ukloni
      </button>
    </div>
  );
}

export default QuestionField;
