import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import api from '../services/api';

function CreateFormPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState([]);

  const handleSave = async () => {
    console.log("Pokušaj slanja forme...", { name, description, isPublic, questions });

    try {
      const token = localStorage.getItem('token');

      // 1) Kreiraj formu
      const formRes = await api.post('/forms', {
        name,
        description,
        is_public: isPublic,
      });
      const formId = formRes.data.id;
      console.log("🆔 Form kreirana sa ID:", formId);

      // 2) Kreiraj pitanja
      await Promise.all(
        questions.map((q, index) => {
          const formData = new FormData();

          formData.append("text", q.text);
          formData.append("type", q.type); // short_text | long_text | single_choice | multiple_choice
          formData.append("is_required", q.is_required);
          formData.append("order", index + 1);

          if (q.type === 'multiple_choice' && q.max_choices !== '' && q.max_choices != null) {
            formData.append("max_choices", Number(q.max_choices));
          }

          if (q.image) {
            formData.append("image", q.image);
          }

          const optionList = (q.options || [])
            .filter(opt => (opt?.text || '').trim() !== '')
            .map(opt => ({ text: opt.text.trim() }));

          formData.append("options", JSON.stringify(optionList));

          (q.options || []).forEach((opt) => {
            if (opt && opt.image) {
              formData.append("option_images", opt.image);
            }
          });

          return api.post(`/forms/${formId}/questions`, formData, {
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
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("Dobijena forma sa backend-a:", res.data);
        } catch (getErr) {
          console.error("Greška pri GET zahtevu:", getErr);
        }
      }, 1500);

    } catch (err) {
      console.error("Greška pri slanju forme:", err);
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
