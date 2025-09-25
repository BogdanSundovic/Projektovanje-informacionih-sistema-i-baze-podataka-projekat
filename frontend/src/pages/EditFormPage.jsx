// src/pages/EditFormPage.jsx

import React, { useEffect, useState, useRef } from 'react';

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import FormBuilder from '../components/FormBuilder';
import CollaboratorsPanel from '../components/CollaboratorsPanel';

function EditFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // koristiš li ?as_user=...

  const [deletedQuestionIds, setDeletedQuestionIds] = useState([]);


  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const originalQuestionsRef = useRef([]);

  const canSave =
    Boolean((form?.name ?? '').trim()) &&
    ((questions?.filter(Boolean).length ?? 0) > 0);


  // --- helpers ---

  const backendToEditorType = (t) =>
    t === 'single_choice' ? 'single_choice'
    : t === 'multiple_choice' ? 'multiple_choice'
    : t;

  const editorToBackendType = (t) =>
    t === 'single_choice' ? 'single_choice'
    : t === 'multiple_choice' ? 'multiple_choice'
    : t;

  const toOptionObjects = (opts) =>
    (opts || []).map((opt) =>
      typeof opt === 'string'
        ? { text: opt }
        : { text: opt?.text ?? '', image: opt?.image || null, image_url: opt?.image_url || null }
    );

  const parseNumericList = (txt, fallback = []) => {
    if (!txt) return fallback;
    return Array.from(
      new Set(
        txt
          .replace(/,/g, ' ')
          .split(/\s+/)
          .map((s) => Number(s.trim()))
          .filter(Number.isFinite)
      )
    ).sort((a, b) => a - b);
  };

  const normalizeRange = (start, end, step) => {
    let s = Number(step);
    if (!Number.isFinite(s) || s === 0) s = 1;
    if (start < end && s < 0) s = Math.abs(s);
    if (start > end && s > 0) s = -Math.abs(s);
    return { start, end, step: s };
  };

  // JSON telo za PUT (update postojećeg pitanja)
  const buildQuestionUpdateBody = (q, { includeOptions = true } = {}) => {
    const base = {
      text: q.text || '',
      type: editorToBackendType(q.type),
      is_required: !!q.is_required,
    };

    if (!includeOptions) return base;

    if (q.type === 'single_choice' || q.type === 'multiple_choice') {
      const body = { ...base };
      body.options = toOptionObjects(q.options).map(({ text }) => ({ text: text || '' }));
      if (q.type === 'multiple_choice' && q.max_choices) {
        body.max_choices = Number(q.max_choices);
      }
      return body;
    }

    if (q.type === 'numeric_choice') {
      const mode = q.numeric_mode || (q.numMode === 'list' ? 'list' : 'range');

      if (mode === 'list') {
        const values = Array.isArray(q.numeric_values) && q.numeric_values.length
          ? q.numeric_values
          : parseNumericList(q.numListText, (q.options || []).map(o => Number(o.text)).filter(Number.isFinite));

        return {
          ...base,
          type: 'numeric_choice',
          options: values.map(v => ({ text: String(v) })),
        };
      }

      const start = q.numeric_scale?.start ?? Number(q.numMin);
      const end   = q.numeric_scale?.end   ?? Number(q.numMax);
      const step0 = q.numeric_scale?.step  ?? Number(q.numStep || 1);
      const { start: s, end: e, step } = normalizeRange(start, end, step0);

      return {
        ...base,
        type: 'numeric_choice',
        numeric_scale: { start: s, end: e, step },
      };
    }

    return base;
  };

  // FormData za POST (kreiranje novog pitanja)
  const buildQuestionCreateFormData = (q, order) => {
    const fd = new FormData();
    fd.append('text', q.text || '');
    fd.append('type', editorToBackendType(q.type));
    fd.append('is_required', String(!!q.is_required));
    fd.append('order', String(order));

    if (q.image) fd.append('image', q.image);

    if (q.type === 'numeric_choice') {
      const mode = q.numeric_mode || (q.numMode === 'list' ? 'list' : 'range');

      if (mode === 'list') {
        // brojevi -> options
        const values = Array.isArray(q.numeric_values) && q.numeric_values.length
          ? q.numeric_values
          : parseNumericList(
              q.numListText,
              (q.options || []).map(o => Number(o.text)).filter(Number.isFinite)
            );

        const asOptions = values.map(v => ({ text: String(v) }));
        fd.append('options', JSON.stringify(asOptions)); // << ključno
      } else {
        // range
        const start = q.numeric_scale?.start ?? Number(q.numMin);
        const end   = q.numeric_scale?.end   ?? Number(q.numMax);
        const step0 = q.numeric_scale?.step  ?? Number(q.numStep || 1);
        const { start: s, end: e, step } = normalizeRange(start, end, step0);
        fd.append('numeric_scale', JSON.stringify({ start: s, end: e, step }));
      }

      // ne šaljemo option_images za numeric
      return fd;
    }

    if (q.type === 'single_choice' || q.type === 'multiple_choice') {
      const keptOptions = (q.options || []).filter(
        (opt) => (opt?.text || '').trim() !== ''
      );

      fd.append(
        'options',
        JSON.stringify(keptOptions.map((opt) => ({ text: opt.text.trim() })))
      );

      if (q.type === 'multiple_choice' && q.max_choices) {
        fd.append('max_choices', String(Number(q.max_choices)));
      }

      keptOptions.forEach((opt) => {
        if (opt && opt.image) {
          fd.append('option_images', opt.image);

        } else {

          // placeholder sa praznim filename-om — backend ga preskače
          fd.append('option_images', new Blob([], { type: 'application/octet-stream' }), '');

        }
      });
    }

    // short_text, long_text, date, datetime – nema dodatnih polja
    return fd;
  };

  // --- učitavanje forme ---
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/forms/${id}`);
        const data = res.data || {};

        const normalizedQuestions = (data.questions || [])
          .filter(Boolean)
          .map((q, idx) => {
            const base = {
              id: q.id,
              text: q.text || '',
              type: backendToEditorType(q.type),
              is_required: !!q.is_required,
              order: q.order ?? idx,
              options: (q.options || []).map((o) => ({
                id: o.id,
                text: o.text ?? '',
                image_url: o.image_url ?? null,
                image: null,
              })),
              max_choices: q.max_choices ?? '',
              image_url: q.image_url ?? null,
              image: null,

              // prenesi BE numerička polja
              numeric_mode: q.numeric_mode ?? null,
              numeric_values: q.numeric_values ?? null,
              numeric_scale: q.numeric_scale ?? null,
            };

            // Ako BE za numeric listu ne šalje numeric_values, izvedi ih iz options da editor prikaže brojeve
            if (q.type === 'numeric_choice' && !q.numeric_values && !q.numeric_scale) {
              const derivedVals = (q.options || [])
                .map(o => Number(o.text))
                .filter(Number.isFinite);
              return {
                ...base,
                numeric_mode: 'list',
                numeric_values: derivedVals,
              };
            }

            return base;
          });

        setForm({
          id: data.id,
          name: data.name || '',
          description: data.description || '',
          is_public: !!data.is_public,
          is_locked: !!data.is_locked,
          owner_id: data.owner_id ?? data.ownerId ?? null,
          capabilities: data.capabilities || null,
        });
        setQuestions(normalizedQuestions);
        originalQuestionsRef.current = JSON.parse(JSON.stringify(normalizedQuestions));
      } catch (err) {
        console.error('Greška pri učitavanju forme:', err?.response?.status, err?.response?.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, location.search]);

  const optionsChanged = (q) => {
    if (!q?.id) return false; // samo za postojeća pitanja
    const original = (originalQuestionsRef.current || []).find((oq) => oq.id === q.id);
    if (!original) return true;

    const currTexts = (q.options || [])
      .map((o) => String(o?.text || '').trim())
      .filter(Boolean);
    const origTexts = (original.options || [])
      .map((o) => String(o?.text || '').trim())
      .filter(Boolean);

    if (currTexts.length !== origTexts.length) return true;
    for (let i = 0; i < currTexts.length; i++) {
      if (currTexts[i] !== origTexts[i]) return true;
    }

    if (q.type === 'multiple_choice') {
      const currMax = q.max_choices !== '' && q.max_choices != null ? Number(q.max_choices) : '';
      const origMax = original.max_choices !== '' && original.max_choices != null ? Number(original.max_choices) : '';
      if (currMax !== origMax) return true;
    }

    if (q.type === 'numeric_choice') {
      const currNum = {
        numeric_mode: q.numeric_mode || null,
        numeric_values: Array.isArray(q.numeric_values) ? q.numeric_values : null,
        numeric_scale: q.numeric_scale || null,
      };
      const origNum = {
        numeric_mode: original.numeric_mode || null,
        numeric_values: Array.isArray(original.numeric_values) ? original.numeric_values : null,
        numeric_scale: original.numeric_scale || null,
      };
      if (JSON.stringify(currNum) !== JSON.stringify(origNum)) return true;
    }

    return false;
  };


  // --- čuvanje: meta + UPDATE postojećih + CREATE novih ---
  const handleSave = async () => {

     if (!canSave) {
    alert('Forma mora imati bar jedno pitanje.');
    return;
  }

    if (!form) return;
    try {
      // 1) meta
      await api.put(`/forms/${id}`, {
        name: form.name,
        description: form.description,
        is_public: form.is_public,
        is_locked: form.is_locked,
      });


      if (deletedQuestionIds.length) {
        await Promise.all(
          deletedQuestionIds.map((qid) =>
            api.delete(`/forms/${id}/questions/${qid}`)
          )
        );
      }

      // 2) UPDATE svih postojećih pitanja (PUT JSON)
      const existing = questions.filter((q) => !!q.id);
        await Promise.all(
          existing.map((q) => {
            const includeOptions = optionsChanged(q);
            return api.put(
              `/forms/${id}/questions/${q.id}`,
              buildQuestionUpdateBody(q, { includeOptions }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          })
        );

        

      // 3) CREATE novih pitanja (POST multipart)
      const created = questions
        .map((q, index) => ({ q, index }))
        .filter(({ q }) => !q.id);

      await Promise.all(
        created.map(({ q, index }) =>
          api.post(
            `/forms/${id}/questions`,
            buildQuestionCreateFormData(q, index),
            { headers: { 'Content-Type': 'multipart/form-data' } }
          )
        )
      );

      alert('Forma uspešno sačuvana.');
      navigate('/my-forms');
    } catch (err) {
      const st = err?.response?.status;
      if (st === 403) {
        alert('Nemate pravo izmene.');
      } else {
        console.error('Greška pri čuvanju izmene:', err);
        alert('Došlo je do greške pri čuvanju.');
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Da li si siguran da želiš da obrišeš ovu formu?')) return;
    try {
      await api.delete(`/forms/${id}`);
      alert('Forma je obrisana.');
      navigate('/my-forms');
    } catch (err) {
      console.error('Greška pri brisanju forme:', err);
      alert('Neuspešno brisanje forme.');
    }
  };

  if (loading) return <p className="forms-loading">Učitavanje…</p>;
  if (!form) return <p className="forms-empty">Forma nije pronađena.</p>;

  return (

     <div className="page">

      <div className="container">
        <div className="form-container">
          <h2>Izmeni formu</h2>

          {/* Naziv */}
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="name">Naziv forme</label>
              <input
                id="name"
                className="input-field"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Naziv forme"
              />
            </div>
          </div>

          {/* Opis */}
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="desc">Opis</label>
              <textarea
                id="desc"
                className="input-field"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Opis"
              />
            </div>
          </div>

          {/* Javna / Zaključana */}
          <div className="form-row inline">
            <label className="muted" htmlFor="isPublic">Javna forma</label>
            <label className="switch">
              <input
                id="isPublic"
                type="checkbox"
                checked={form.is_public}
                onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
              />
              <span className="slider" />
            </label>
          </div>

          <div className="form-row inline">
            <label className="muted" htmlFor="isLocked">Zaključaj formu</label>
            <label className="switch">
              <input
                id="isLocked"
                type="checkbox"
                checked={!!form.is_locked}
                onChange={(e) => setForm({ ...form, is_locked: e.target.checked })}
              />
              <span className="slider" />
            </label>
          </div>

          {/* Pitanja */}
          <h3 className="section-title">Pitanja</h3>
          <div className="form-question-list">

            <FormBuilder
              questions={questions}
              setQuestions={setQuestions}
              onRemoveQuestion={(q) => {
                if (q?.id) {
                  setDeletedQuestionIds((prev) =>
                    prev.includes(q.id) ? prev : [...prev, q.id]
                  );
                }
              }}
            />

          </div>

          {/* KOLABORATORI */}
          <h3 className="section-title" style={{ marginTop: 24 }}>Kolaboratori</h3>
          <CollaboratorsPanel formId={id} />

          {/* Akcije */}
          <div className="actions-col">

            <button
              className="form-button"
              type="button"
              onClick={handleSave}
              disabled={!canSave}
            >

              Sačuvaj izmene
            </button>

            <button
              className="form-button"
              type="button"
              onClick={handleDelete}
              style={{ backgroundColor: '#dc3545' }}
            >
              🗑️ Obriši formu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


export default EditFormPage;

