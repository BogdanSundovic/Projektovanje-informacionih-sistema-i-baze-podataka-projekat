import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import FormBuilder from '../components/FormBuilder';
import { useNavigate } from 'react-router-dom';

function EditFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);

   const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const token = localStorage.getItem("token");
      const res = await api.get(`/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
        setForm(res.data);
        setQuestions(res.data.questions || []);

      const tokenData = JSON.parse(atob(token.split('.')[1]));
        if (res.data.owner_id === tokenData.user_id || res.data.owner_id === tokenData.id) {
          setIsOwner(true);
        }
      } catch (err) {
        console.error('Greška pri učitavanju forme:', err);
      }
    };
    fetchForm();
  }, [id]);

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    try {
      await api.put(`/forms/${id}`, {
        name: form.name,
        description: form.description,
        is_public: form.is_public,
      }, {
         headers: {
           Authorization: `Bearer ${token}`,
         },
      });
      await Promise.all(
        questions
          .filter((q) => !q.id)
          .map((q, index) => {
            const payload = {
              text: q.text,
              type: q.type === 'radio' ? 'single_choice'
                   : q.type === 'checkbox' ? 'multiple_choice'
                   : q.type,
              is_required: q.is_required,
              order: index,
              options: (q.options || []).map(opt => ({ text: opt })),
              max_choices: q.type === 'checkbox' ? q.max_choices ?? q.options.length : 1
            };

            return api.post(`/forms/${id}/questions`, payload, {
              headers: {
                Authorization: `Bearer ${token}`,
              }
            });
          })
      );

      alert('Forma uspešno sačuvana.');
      navigate('/my-forms')
    } catch (err) {
      console.error('Greška pri čuvanju izmene:', err);
    }
  };

  const normalizeType = (type) => {
  if (type === 'single_choice') return 'radio';
  if (type === 'multiple_choice') return 'checkbox';
  return type; 
  };
  const handleDelete = async () => {
  if (!window.confirm("Da li si siguran da želiš da obrišeš ovu formu?")) return;

  const token = localStorage.getItem("token");
  try {
    await api.delete(`/forms/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    alert("Forma je obrisana.");
    navigate("/my-forms");
  } catch (err) {
    console.error("Greška pri brisanju forme:", err);
    alert("Neuspešno brisanje forme.");
  }
};

  if (!form) return <p>Učitavanje...</p>;

  return (
    <div className="form-container">
      <h2>Izmeni formu</h2>
      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <div className="input-group">
        <label>
          <input
            type="checkbox"
            checked={form.is_public}
            onChange={(e) =>
              setForm({ ...form, is_public: e.target.checked })
            }
          />
          Javna forma
        </label>
      </div>
      <FormBuilder questions={questions} setQuestions={setQuestions} />
      <button onClick={handleSave}>Sačuvaj izmene</button>
      {isOwner && (
        <button
          className="form-button"
          style={{ backgroundColor: '#dc3545', marginTop: '10px' }}
          onClick={handleDelete}
        >
          🗑️ Obriši formu
        </button>
      )}
    </div>
  );
}

export default EditFormPage;
