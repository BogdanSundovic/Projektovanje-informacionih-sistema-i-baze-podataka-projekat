// src/pages/CreateFormPage.jsx

import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import api from '../services/api';
import { decodeToken } from '../utils/decodeToken';

function CreateFormPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState([]);

  const handleSave = async () => {
    console.log(" Pokušaj slanja forme...");
    console.log(" Ime:", name);
    console.log(" Opis:", description);
    console.log(" Javna:", isPublic);
    console.log(" Pitanja:", questions);

    try {
      const token = localStorage.getItem('token');

      const formRes = await api.post('/forms', {
        name,
        description,
        is_public: isPublic,
      });

      const formId = formRes.data.id;
      console.log("🆔 Form kreirana sa ID:", formId);

      await Promise.all(
        questions.map((q, index) => {
          const formData = new FormData();

          formData.append("text", q.text);
          formData.append(
            "type",
            q.type === 'radio' ? 'single_choice' :
            q.type === 'checkbox' ? 'multiple_choice' :
            q.type
          );
          formData.append("is_required", q.is_required);
          formData.append("order", index);

          if (q.max_choices && q.type === 'checkbox') {
            formData.append("max_choices", q.max_choices);
          }

          if (q.image) {
            formData.append("image", q.image); 
          }

          const optionList = (q.options || []).map(opt =>
            typeof opt === 'string' ? { text: opt } : { text: opt.text }
          );
          formData.append("options", JSON.stringify(optionList));

          (q.options || []).forEach((opt) => {
            if (typeof opt === 'object' && opt.image) {
              formData.append("option_images", opt.image);
            }
          });

          return api.post(`/forms/${formId}/questions`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          });
        })
      );

      alert('Forma uspešno sačuvana!');

      setTimeout(async () => {
        try {
          const res = await api.get(`/forms/${formId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("Dobijena forma sa backend-a:", res.data);
        } catch (getErr) {
          console.error(" Greška pri GET zahtevu:", getErr);
        }
      }, 3000);

    } catch (err) {
      console.error("Greška pri slanju forme:", err);
      alert('Došlo je do greške.');
    }
  };

  return (
    <div className="form-container">
      <h2>Kreiraj novu formu</h2>

      <input
        type="text"
        placeholder="Naziv forme"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <textarea
        placeholder="Opis"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={() => setIsPublic(!isPublic)}
        />
        Javna forma
      </label>

      <FormBuilder questions={questions} setQuestions={setQuestions} />

      <button onClick={handleSave}>Sačuvaj formu</button>
    </div>
  );
}

export default CreateFormPage;
