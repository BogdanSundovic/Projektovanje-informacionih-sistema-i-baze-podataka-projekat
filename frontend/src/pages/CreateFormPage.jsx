// src/pages/CreateFormPage.jsx

import React, { useState } from 'react';
import FormBuilder from '../components/FormBuilder';
import api from '../services/api';

function CreateFormPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [questions, setQuestions] = useState([]);

  const handleSave = async () => {
    try {
      const formRes = await api.post('/api/forms', {
        name,
        description,
        is_public: isPublic,
      });

      const formId = formRes.data.id;
      await Promise.all(
        questions.map((q) =>
          api.post(`/api/forms/${formId}/questions`, q)
        )
      );

      alert('Forma uspešno sačuvana!');
    } catch (err) {
      console.error('Greška pri kreiranju forme:', err);
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
