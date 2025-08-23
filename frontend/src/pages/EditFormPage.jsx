// src/pages/EditFormPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import FormBuilder from '../components/FormBuilder';
import CollaboratorsPanel from "../components/CollaboratorsPanel";

function EditFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isOwner, setIsOwner] = useState(false);

  const normalizeQuestionFromApi = (q, idx) => ({
    id: q.id,
    text: q.text || '',
    type: q.type, // short_text | long_text | single_choice | multiple_choice
    is_required: !!q.is_required,
    order: q.order ?? idx + 1,
    image: null,
    image_url: q.image_url || null,
    image_preview: null,
    options: (q.options || []).map((opt) => ({
      localId: opt.id ?? crypto.randomUUID(),
      text: opt.text ?? '',
      image: null,
      image_url: opt.image_url || null,
      image_preview: null,
    })),
    max_choices: q.type === 'multiple_choice' ? (q.max_choices ?? '') : '',
  });

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/forms/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const normalizedQuestions = (res.data.questions || [])
          .filter(Boolean)
          .map((q, idx) => normalizeQuestionFromApi(q, idx));

        setForm({
          id: res.data.id,
          name: res.data.name || '',
          description: res.data.description || '',
          is_public: !!res.data.is_public,
          owner_id: res.data.owner_id,
        });
        setQuestions(normalizedQuestions);

        const tokenStr = localStorage.getItem('token');
        if (tokenStr) {
          const tokenData = JSON.parse(atob(tokenStr.split('.')[1]));
          if (
            res.data.owner_id === tokenData.user_id ||
            res.data.owner_id === tokenData.id
          ) {
            setIsOwner(true);
          }
        }
      } catch (err) {
        console.error('Greška pri učitavanju forme:', err);
      }
    };
    fetchForm();
  }, [id]);

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      // 1) meta
      await api.put(
        `/forms/${id}`,
        {
          name: form.name,
          description: form.description,
          is_public: form.is_public,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2) nova pitanja (bez id)
      await Promise.all(
        questions
          .filter((q) => !q.id)
          .map((q, index) => {
            const formData = new FormData();
            formData.append('text', q.text);
            formData.append('type', q.type);
            formData.append('is_required', q.is_required);
            formData.append('order', index + 1);

            if (q.type === 'multiple_choice' && q.max_choices !== '' && q.max_choices != null) {
              formData.append('max_choices', Number(q.max_choices));
            }

            if (q.image) formData.append('image', q.image);

            const optionList = (q.options || [])
              .filter(o => (o.text || '').trim() !== '')
              .map(o => ({ text: o.text.trim() }));
            formData.append('options', JSON.stringify(optionList));

            (q.options || []).forEach((o) => {
              if (o && o.image) formData.append('option_images', o.image);
            });

            return api.post(`/forms/${id}/questions`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            });
          })
      );

      alert('Forma uspešno sačuvana.');
      navigate('/my-forms');
    } catch (err) {
      console.error('Greška pri čuvanju izmene:', err);
      alert('Došlo je do greške pri čuvanju.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Da li si siguran da želiš da obrišeš ovu formu?')) return;
    const token = localStorage.getItem('token');
    try {
      await api.delete(`/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Forma je obrisana.');
      navigate('/my-forms');
    } catch (err) {
      console.error('Greška pri brisanju forme:', err);
      alert('Neuspešno brisanje forme.');
    }
  };

  if (!form) return <p className="forms-loading">Učitavanje…</p>;

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

          {/* Javna forma – toggle */}
          <div className="form-row inline">
            <label className="muted" htmlFor="isPublic">
              Javna forma
            </label>
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

          {/* Pitanja */}
          <h3 className="section-title">Pitanja</h3>
          <div className="form-question-list">
            <FormBuilder questions={questions} setQuestions={setQuestions} />
          </div>
          {/* Kolaboratori – samo owner vidi (panel sam sakriva na 403) */}
            <h3 className="section-title">Kolaboratori</h3>
            <CollaboratorsPanel formId={id} />
          {/* Akcije */}
          <div className="actions-col">
            <button className="form-button" type="button" onClick={handleSave}>
              Sačuvaj izmene
            </button>

            {isOwner && (
              <button
                className="form-button"
                type="button"
                onClick={handleDelete}
                style={{ backgroundColor: '#dc3545' }}
              >
                🗑️ Obriši formu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditFormPage;
