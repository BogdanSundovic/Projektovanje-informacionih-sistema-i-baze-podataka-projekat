import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import api from '../services/api';

function CreateFormPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState([]);

  // helper: parsiranje ručno unete liste brojeva
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

  const handleSave = async () => {
    console.log('Pokušaj slanja forme...', { name, description, isPublic, questions });

    try {
      const token = localStorage.getItem('token');

      // 1) Kreiraj formu
      const formRes = await api.post('/forms', {

        name,
        description,
        is_public: isPublic,
      });

      const formId = formRes.data.id;
      console.log('🆔 Form kreirana sa ID:', formId);

      // 2) Kreiraj pitanja
      await Promise.all(
        questions.map((q, index) => {
          const fd = new FormData();

          fd.append('text', q.text || '');
          fd.append('type', q.type); // short_text | long_text | single_choice | multiple_choice | numeric_choice | date | datetime
          fd.append('is_required', String(!!q.is_required));
          fd.append('order', String(index + 1));

          if (q.image) {
            fd.append('image', q.image);
          }

          // --- NUMERIC_CHOICE (BE generiše options) ---
          if (q.type === 'numeric_choice') {
            // koristi već postavljen BE način ako postoji, inače UI stanje
            const mode = q.numeric_mode || (q.numMode === 'list' ? 'list' : 'range');
            fd.append('numeric_mode', mode);

            if (mode === 'list') {
              const values = Array.isArray(q.numeric_values)
                ? q.numeric_values
                : parseNumericList(
                    q.numListText,
                    (q.options || [])
                      .map((o) => Number(o.text))
                      .filter(Number.isFinite)
                  );
              fd.append('numeric_values', JSON.stringify(values));
            
              // ne šaljemo 'options' niti 'option_images'
               const asOptions = values.map((v) => ({ text: String(v) }));
                fd.append('options', JSON.stringify(asOptions));
            } else {
              const start =
                q.numeric_scale?.start ?? Number(q.numMin);
              const end =
                q.numeric_scale?.end ?? Number(q.numMax);
              const stepRaw =
                q.numeric_scale?.step ?? Number(q.numStep || 1);
              const { start: s, end: e, step } = normalizeRange(start, end, stepRaw);
              fd.append('numeric_scale', JSON.stringify({ start: s, end: e, step }));
              // ne šaljemo 'options' niti 'option_images'
            }

            // RETURN ovde da ne upadnemo u branch za klasične opcije
            return api.post(`/forms/${formId}/questions`, fd, {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            });
          }

          // --- KLASIČNI CHOICE TIPOVI ---
          if (q.type === 'single_choice' || q.type === 'multiple_choice') {
            const optionList = (q.options || [])
              .filter((opt) => (opt?.text || '').trim() !== '')
              .map((opt) => ({ text: opt.text.trim() }));

            fd.append('options', JSON.stringify(optionList));

            if (q.type === 'multiple_choice' && q.max_choices !== '' && q.max_choices != null) {
              fd.append('max_choices', String(Number(q.max_choices)));
            }

            // slike opcija (ako postoje)
            (q.options || []).forEach((opt) => {
              if (opt && opt.image) {
                fd.append('option_images', opt.image);
              }
            });
          }

          // Za short_text, long_text, date, datetime — nema dodatnih polja

          return api.post(`/forms/${formId}/questions`, fd, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`, // opciono, imaš i interceptor
            },
          });
        })
      );

      alert('Forma uspešno sačuvana!');

      // (opciono) verifikacija GET-om
      setTimeout(async () => {
        try {
          const res = await api.get(`/forms/${formId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Dobijena forma sa backend-a:', res.data);
        } catch (getErr) {
          console.error('Greška pri GET zahtevu:', getErr);
        }
      }, 1000);
    } catch (err) {
      console.error('Greška pri slanju forme:', err);

      alert('Došlo je do greške.');
    }
  };

  return (

    <div className="page">
      <div className="container">
        <div className="form-container">
          <h2>Kreiraj novu formu</h2>

          {/* Naziv forme */}
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="form-name">Naziv forme</label>
              <input
                id="form-name"
                type="text"
                className="input-field"
                placeholder="Naziv forme"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Opis */}
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="form-desc">Opis</label>
              <textarea
                id="form-desc"
                className="input-field"
                placeholder="Opis"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Javna forma – toggle */}
          <div className="form-row inline">
            <label className="muted" htmlFor="isPublic">Javna forma</label>
            <label className="switch">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
              />
              <span className="slider" />
            </label>
          </div>

          {/* Sekcija pitanja */}
          <h3 className="section-title">Pitanja</h3>
          <div className="form-question-list">
            <FormBuilder questions={questions} setQuestions={setQuestions} />
          </div>

          {/* Akcije */}
          <div className="actions-col">
            <button onClick={handleSave} className="form-button">
              Sačuvaj formu
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default CreateFormPage;
