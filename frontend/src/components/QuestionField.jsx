import React, { useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';

const DEFAULT_QUESTION = {
  text: '',
  type: 'short_text', // short_text | long_text | single_choice | multiple_choice
  is_required: false,
  options: [],
  image: null,          // File
  image_url: null,      // postojeći URL sa BE
  image_preview: null,  // objectURL kad user izabere novu sliku
  max_choices: '',
};

const isChoiceType = (t) => t === 'single_choice' || t === 'multiple_choice';

// stabilan key za opcije
const ensureLocalId = (o) => ({
  localId: o?.localId || o?.id || crypto.randomUUID(),
  text: o?.text ?? '',
  image: o?.image ?? null,                  // File
  image_url: o?.image_url ?? null,          // postojeći URL
  image_preview: o?.image_preview ?? null,  // objectURL za novu
});

function QuestionField({ index, question, updateQuestion, removeQuestion }) {
  const [localQ, setLocalQ] = useState(() => ({
    ...DEFAULT_QUESTION,
    ...(question || {}),
    options: (question?.options || []).map(ensureLocalId),
  }));

  useEffect(() => {
    setLocalQ({
      ...DEFAULT_QUESTION,
      ...(question || {}),
      options: (question?.options || []).map(ensureLocalId),
    });
  }, [question]);

  const setAndPropagate = (next) => {
    setLocalQ(next);
    updateQuestion(index, next);
  };

  const handleChange = (field, value) => {
    setAndPropagate({ ...localQ, [field]: value });
  };

  const handleTypeChange = (newType) => {
    if (isChoiceType(newType)) {
      const mc = newType === 'multiple_choice' ? (localQ.max_choices ?? '') : '';
      const opts = (localQ.options || []).map(ensureLocalId);
      setAndPropagate({ ...localQ, type: newType, options: opts, max_choices: mc });
    } else {
      setAndPropagate({ ...localQ, type: newType, options: [], max_choices: '' });
    }
  };

  // QUESTION image
  const handleQuestionImage = (file) => {
    const preview = file ? URL.createObjectURL(file) : null;
    setAndPropagate({ ...localQ, image: file, image_preview: preview });
  };

  // OPTION handlers
  const handleOptionTextChange = (localId, value) => {
    const opts = (localQ.options || []).map((o) =>
      o.localId === localId ? { ...o, text: value } : o
    );
    setAndPropagate({ ...localQ, options: opts });
  };

  const handleOptionImageChange = (localId, file) => {
    const preview = file ? URL.createObjectURL(file) : null;
    const opts = (localQ.options || []).map((o) =>
      o.localId === localId ? { ...o, image: file, image_preview: preview } : o
    );
    setAndPropagate({ ...localQ, options: opts });
  };

  const addOption = () => {
    const nextOpt = ensureLocalId({ text: '', image: null, image_url: null });
    setAndPropagate({ ...localQ, options: [...(localQ.options || []), nextOpt] });
  };

  const removeOption = (localId) => {
    const opts = (localQ.options || []).filter((o) => o.localId !== localId);
    setAndPropagate({ ...localQ, options: opts });
  };

  // bira šta da prikaže kao sliku
  const qImageSrc = localQ.image_preview || localQ.image_url || null;

  return (
    <div className="question-block">
      <input
        type="text"
        placeholder="Tekst pitanja"
        value={localQ.text}
        onChange={(e) => handleChange('text', e.target.value)}
        className="input-field"
      />

      {/* slika pitanja */}
      <input
        type="file"
        accept="image/*"
        className="file-field"
        onChange={(e) => handleQuestionImage(e.target.files[0])}
      />
      {qImageSrc && (
        <img
          src={qImageSrc}
          alt="Slika pitanja"
          className="question-thumb"
        />
      )}

      <select
        className="input-field"
        value={localQ.type}
        onChange={(e) => handleTypeChange(e.target.value)}
      >
        <option value="short_text">Kratak tekst (do 512 karaktera)</option>
        <option value="long_text">Dug tekst (do 4096 karaktera)</option>
        <option value="single_choice">Jedan izbor</option>
        <option value="multiple_choice">Više izbora</option>
      </select>

      <div className="form-row inline" style={{ alignItems: 'center' }}>
        <label className="muted" htmlFor={`req-${index}`}>Obavezno</label>
        <label className="switch">
          <input
            id={`req-${index}`}
            type="checkbox"
            checked={!!localQ.is_required}
            onChange={(e) => handleChange('is_required', e.target.checked)}
          />
          <span className="slider" />
        </label>
      </div>

      {isChoiceType(localQ.type) && (
        <>
          {(localQ.options || []).map((opt) => {
            const optImg = opt.image_preview || opt.image_url || null;
            return (
              <div key={opt.localId} className="option-row">
                {/* kolona 1: vizuelni bullet */}
                <div className="option-bullet" aria-hidden="true">
                  {localQ.type === 'single_choice' ? (
                    <input type="radio" disabled />
                  ) : (
                    <input type="checkbox" disabled />
                  )}
                </div>

                {/* kolona 2: tekst opcije */}
                <input
                  type="text"
                  className="option-text"
                  placeholder="Opcija"
                  value={opt.text}
                  onChange={(e) => handleOptionTextChange(opt.localId, e.target.value)}
                />

                {/* kolona 3: akcije (thumbnail + upload + ukloni) */}
                <div className="option-actions">
                  {optImg && (
                    <img
                      src={optImg}
                      alt="Slika opcije"
                      className="option-thumb"
                    />
                  )}

                  <label className="option-file-btn">
                    Dodaj sliku
                    <input
                      type="file"
                      accept="image/*"
                      className="option-file"
                      onChange={(e) => handleOptionImageChange(opt.localId, e.target.files[0])}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => removeOption(opt.localId)}
                    className="btn-ghost"
                    title="Ukloni opciju"
                  >
                    Ukloni
                  </button>
                </div>
              </div>
            );
          })}

          <div className="button-group">
            <button type="button" className="form-button" onClick={addOption}>
              Dodaj opciju
            </button>
          </div>
        </>
      )}

      {localQ.type === 'multiple_choice' && (
        <input
          type="number"
          className="input-field"
          placeholder="Broj dozvoljenih odgovora (opcionalno)"
          value={localQ.max_choices}
          min={1}
          onChange={(e) => {
            const v = e.target.value === '' ? '' : Number(e.target.value);
            handleChange('max_choices', v);
          }}
        />
      )}

      <div className="button-group" style={{ justifyContent: 'flex-end' }}>
        <button className="form-button" type="button" onClick={() => removeQuestion(index)}>
          <FiTrash2 style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Ukloni pitanje
        </button>
      </div>
    </div>
  );
}

export default QuestionField;
