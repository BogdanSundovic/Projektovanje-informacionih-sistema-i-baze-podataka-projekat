// src/components/QuestionField.jsx
import React, { useState, useEffect } from 'react';
import { FiTrash2 } from 'react-icons/fi';

const DEFAULT_QUESTION = {
  text: '',
  type: 'short_text', // short_text | long_text | single_choice | multiple_choice | numeric_choice | date | datetime
  is_required: false,
  options: [],
  image: null,
  image_url: null,
  image_preview: null,
  max_choices: '',

  // FRONTEND pomoćna polja za numerički UI (ne moraju na BE)
  numMode: 'range',     // 'range' | 'list'
  numMin: '',
  numMax: '',
  numStep: '',
  numListText: '',

  // BACKEND polja (Edit/Save koristi ovo za slanje/čitanje)
  numeric_mode: null,       // 'list' | 'range' | null
  numeric_values: null,     // [brojevi] ako je list
  numeric_scale: null,      // {start,end,step} ako je range
};

const isChoiceType = (t) => t === 'single_choice' || t === 'multiple_choice';

// stabilan key za opcije
const ensureLocalId = (o) => ({
  localId: o?.localId || o?.id || crypto.randomUUID(),
  id: o?.id,
  text: o?.text ?? '',
  image: o?.image ?? null,
  image_url: o?.image_url ?? null,
  image_preview: o?.image_preview ?? null,
});

function QuestionField({ index, question, updateQuestion, removeQuestion, hideRemoveButton }) {
  // dozvoli samo opcioni minus na početku + cifre (negativni/pozitivni integer)
  const onlyInt = (s) => {
    let t = String(s ?? '');
    t = t.replace(/\u2212/g, '-');     // unicode minus → '-'
    t = t.replace(/[^\d-]/g, '');      // sve sem cifara i '-'
    t = t.replace(/(?!^)-/g, '');      // samo jedan '-' i to na početku
    return t;
  };

  // generiši niz brojeva iz {start,end,step}
  const computeRangeValues = (scale) => {
    if (!scale) return [];
    let { start, end, step } = scale;
    start = Number(start); end = Number(end); step = Number(step);
    if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(step) || step === 0) return [];
    const s = start <= end ? Math.abs(step) : -Math.abs(step);
    const values = [];
    for (let x = start; start <= end ? x <= end : x >= end; x += s) values.push(x);
    return values;
  };

  // iz BE numeričkih polja napravi pomoćna UI polja + preview options
  const inflateNumericFromBackend = (q) => {
    if (q?.type !== 'numeric_choice') return q;

    let numMode = 'range';
    let numMin = '', numMax = '', numStep = '', numListText = '';
    let options = q.options || [];

    if (q.numeric_mode === 'list' && Array.isArray(q.numeric_values)) {
      numMode = 'list';
      numListText = q.numeric_values.join(', ');
      options = q.numeric_values.map((v) => ensureLocalId({ text: String(v) }));
    } else if (q.numeric_mode === 'range' && q.numeric_scale) {
      numMode = 'range';
      const { start, end, step } = q.numeric_scale;
      numMin = (start ?? '').toString();
      numMax = (end ?? '').toString();
      numStep = (step ?? '').toString();
      const vals = computeRangeValues(q.numeric_scale);
      options = vals.map((v) => ensureLocalId({ text: String(v) }));
    }

    return { ...q, numMode, numMin, numMax, numStep, numListText, options };
  };

  const [localQ, setLocalQ] = useState(() => {
    const base = { ...DEFAULT_QUESTION, ...(question || {}) };
    base.options = (base.options || []).map(ensureLocalId);
    return inflateNumericFromBackend(base);
  });

  // sync iz parenta (npr. posle fetch-a) — ali NE briši lokalni numeric unos dok nije generisan
  useEffect(() => {
    const base = { ...DEFAULT_QUESTION, ...(question || {}) };
    base.options = (base.options || []).map(ensureLocalId);

    setLocalQ((prev) => {
      const incoming = inflateNumericFromBackend(base);
      if (incoming.type === 'numeric_choice' && !incoming.numeric_mode) {
        // parent još nema numeric_mode => zadrži lokalni unos
        return {
          ...incoming,
          numMode: prev.numMode,
          numMin: prev.numMin,
          numMax: prev.numMax,
          numStep: prev.numStep,
          numListText: prev.numListText,
          options: prev.options,
        };
      }
      return incoming;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const setAndPropagate = (next) => {
    setLocalQ(next);
    updateQuestion(index, next);
  };

  const handleChange = (field, value) => {
    setAndPropagate({ ...localQ, [field]: value });
  };

  // LOCAL ONLY za numerična polja — ne zovi parent dok ne kliknemo "Generiši listu"
  const handleNumericUIChange = (field, value) => {
    setLocalQ((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (newType) => {
    if (newType === 'multiple_choice' || newType === 'single_choice') {
      const mc = newType === 'multiple_choice' ? (localQ.max_choices ?? '') : '';
      const opts = (localQ.options || []).map(ensureLocalId);
      setAndPropagate({
        ...localQ,
        type: newType,
        options: opts,
        max_choices: mc,
        numeric_mode: null,
        numeric_values: null,
        numeric_scale: null,
        numMode: 'range',
        numMin: '', numMax: '', numStep: '', numListText: '',
      });
    } else if (newType === 'numeric_choice') {
      setAndPropagate({
        ...localQ,
        type: newType,
        options: [],
        max_choices: '',
        numeric_mode: null,
        numeric_values: null,
        numeric_scale: null,
        numMode: 'range',
        numMin: '', numMax: '', numStep: '', numListText: '',
      });
    } else {
      setAndPropagate({
        ...localQ,
        type: newType,
        options: [],
        max_choices: '',
        numeric_mode: null,
        numeric_values: null,
        numeric_scale: null,
        numMode: 'range',
        numMin: '', numMax: '', numStep: '', numListText: '',
      });
    }
  };

  // QUESTION image
  const handleQuestionImage = (file) => {
    if (localQ.image_preview) URL.revokeObjectURL(localQ.image_preview);
    const preview = file ? URL.createObjectURL(file) : null;
    setAndPropagate({ ...localQ, image: file, image_preview: preview });
  };

  // OPTION handlers (za klasične choice tipove)
  const handleOptionTextChange = (localId, value) => {
    const opts = (localQ.options || []).map((o) =>
      o.localId === localId ? { ...o, text: value } : o
    );
    setAndPropagate({ ...localQ, options: opts });
  };

  const handleOptionImageChange = (localId, file) => {
    const opts = (localQ.options || []).map((o) => {
      if (o.localId !== localId) return o;
      if (o.image_preview) URL.revokeObjectURL(o.image_preview);
      const image_preview = file ? URL.createObjectURL(file) : null;
      return { ...o, image: file, image_preview };
    });
    setAndPropagate({ ...localQ, options: opts });
  };

  const addOption = () => {
    const nextOpt = ensureLocalId({ text: '', image: null, image_url: null });
    setAndPropagate({ ...localQ, options: [...(localQ.options || []), nextOpt] });
  };

  const removeOption = (localId) => {
    const opts = (localQ.options || [])
      .map((o) => {
        if (o.localId === localId && o.image_preview) URL.revokeObjectURL(o.image_preview);
        return o;
      })
      .filter((o) => o.localId !== localId);
    setAndPropagate({ ...localQ, options: opts });
  };

  // cleanup objectURL-ova na unmount-u
  useEffect(() => {
    return () => {
      if (localQ.image_preview) URL.revokeObjectURL(localQ.image_preview);
      (localQ.options || []).forEach((o) => {
        if (o.image_preview) URL.revokeObjectURL(o.image_preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // preview image za pitanje
  const qImageSrc = localQ.image_preview || localQ.image_url || null;

  // generiši numeričke opcije + upiši backend polja (numeric_mode/values/scale)
  const generateNumericOptions = () => {
    let values = [];

    if (localQ.numMode === 'range') {
      const min = Number(localQ.numMin);
      const max = Number(localQ.numMax);
      const stepRaw = Number(localQ.numStep);

      if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(stepRaw) || stepRaw === 0) {
        alert('Proveri MIN, MAX i KORAK (korak ne sme biti 0).');
        return;
      }
      const step = min <= max ? Math.abs(stepRaw) : -Math.abs(stepRaw);
      for (let x = min; min <= max ? x <= max : x >= max; x += step) values.push(x);

      setAndPropagate({
        ...localQ,
        options: values.map((v) => ensureLocalId({ text: String(v) })),
        numeric_mode: 'range',
        numeric_scale: { start: min, end: max, step },
        numeric_values: null,
      });
      return;
    }

    // 'list' — parsiraj ručni unos
    const raw = (localQ.numListText || '')
      .replace(/,/g, ' ')
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    for (const tok of raw) {
      const n = Number(tok.replace(/\u2212/g, '-'));
      if (Number.isFinite(n)) values.push(n);
    }
    values = Array.from(new Set(values)).sort((a, b) => a - b);

    if (values.length === 0) {
      alert('Unesi bar jedan broj.');
      return;
    }

    setAndPropagate({
      ...localQ,
      options: values.map((v) => ensureLocalId({ text: String(v) })),
      numeric_mode: 'list',
      numeric_values: values,
      numeric_scale: null,
    });

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

      {/* Slika pitanja */}
      <input
        type="file"
        accept="image/*"
        className="file-field input-field"
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
        <option value="numeric_choice">Jedan numerički izbor (lista/skala)</option>
        <option value="date">Datum</option>
        <option value="datetime">Datum i vreme</option>
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

      {/* STANDARDNE OPCIJE: single/multiple choice */}
      {isChoiceType(localQ.type) && (
        <>
          {(localQ.options || []).map((opt) => {
            const optImg = opt.image_preview || opt.image_url || null;
            return (
              <div key={opt.localId} className="option-row">
                <div className="option-bullet" aria-hidden="true" />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Opcija"
                  value={opt.text}
                  onChange={(e) => handleOptionTextChange(opt.localId, e.target.value)}
                />
                <div className="option-actions">
                  {optImg && (
                    <img
                      src={optImg}
                      alt="Slika opcije"
                      className="option-thumb"
                    />
                  )}
                  <label className="btn-ghost" style={{ cursor: 'pointer' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleOptionImageChange(opt.localId, e.target.files[0])}
                      style={{ display: 'none' }}
                    />
                    Dodaj sliku
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

      {/* NUMERIC CHOICE */}
      {localQ.type === 'numeric_choice' && (
        <div className="numeric-box">
          <div className="form-row inline" style={{ gap: 12 }}>
            <label className="muted">Način:</label>
            <select
              className="input-field"
              style={{ maxWidth: 220 }}
              value={localQ.numMode}
              onChange={(e) => handleNumericUIChange('numMode', e.target.value)}
            >
              <option value="range">Opseg sa korakom</option>
              <option value="list">Ručno uneta lista</option>
            </select>
          </div>

          {localQ.numMode === 'range' ? (
            <div className="form-row inline" style={{ gap: 8 }}>
              {/* MIN */}
              <input
                type="text"
                inputMode="numeric"
                pattern="-?[0-9]*"
                className="input-field"
                placeholder="Min (npr. -4)"
                value={localQ.numMin}
                onChange={(e) => handleNumericUIChange('numMin', onlyInt(e.target.value))}
              />
              {/* MAX */}
              <input
                type="text"
                inputMode="numeric"
                pattern="-?[0-9]*"
                className="input-field"
                placeholder="Max (npr. 20)"
                value={localQ.numMax}
                onChange={(e) => handleNumericUIChange('numMax', onlyInt(e.target.value))}
              />
              {/* STEP */}
              <input
                type="text"
                inputMode="numeric"
                pattern="-?[0-9]*"
                className="input-field"
                placeholder="Korak (npr. 3)"
                value={localQ.numStep}
                onChange={(e) => handleNumericUIChange('numStep', onlyInt(e.target.value))}
              />
              <button
                type="button"
                className="form-button"
                onClick={generateNumericOptions}
                title="Generiši brojeve i upiši u podešavanja"
              >
                Generiši listu
              </button>
            </div>
          ) : (
            <div className="form-row">
              <textarea
                className="input-field"
                placeholder="Unesi brojeve razdvojene zarezom ili razmakom (npr. -4, -1, 2, 5)"
                value={localQ.numListText}
                onChange={(e) => handleNumericUIChange('numListText', e.target.value)}
                rows={3}
              />
              <div className="button-group" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="form-button"
                  onClick={generateNumericOptions}
                >
                  Generiši listu
                </button>
              </div>
            </div>
          )}

          {(localQ.options || []).length > 0 && (
            <div className="muted" style={{ marginTop: 8 }}>
              Generisane vrednosti: {(localQ.options || []).map(o => o.text).join(', ')}
            </div>
          )}
        </div>
      )}

      {!hideRemoveButton && (
        <div className="button-group" style={{ justifyContent: 'flex-end' }}>
          <button className="form-button" type="button" onClick={() => removeQuestion(index)}>
            <FiTrash2 style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Ukloni pitanje
          </button>
        </div>
      )}

    </div>
  );
}

export default QuestionField;
