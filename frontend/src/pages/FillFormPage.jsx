// src/pages/FillFormPage.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/form.css";

const BASE_URL = process.env.REACT_APP_API_URL || "https://e35ec7b1f459.ngrok-free.app";

const FillFormPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    api.get(`/forms/${id}`)
      .then((res) => {
        console.log(" Primljena forma:", res.data);
        setForm(res.data);
      })
      .catch((err) => {
        console.error(" Greška pri dohvatanju forme:", err.response?.status, err.response?.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    // Validacija obaveznih pitanja
    for (const q of form.questions || []) {
      const val = answers[q.id];

      if (q.is_required) {
        if (
          (q.type === "short_text" || q.type === "long_text") &&
          (!val || val.trim() === "")
        ) {
          alert(`Pitanje "${q.text}" je obavezno.`);
          return;
        }

        if (
          (q.type === "radio" || q.type === "single_choice") &&
          !val
        ) {
          alert(`Pitanje "${q.text}" je obavezno.`);
          return;
        }

        if (
          (q.type === "checkbox" || q.type === "multiple_choice") &&
          (!val || val.length === 0)
        ) {
          alert(`Pitanje "${q.text}" je obavezno.`);
          return;
        }
      }
    }

    const payload = {
      answers: Object.entries(answers).map(([question_id, answer]) => ({
        question_id: parseInt(question_id),
        answer,
      })),
    };

    console.log("📤 Slanje odgovora:", payload);
    try {
      await api.post(`/forms/${id}/answers`, payload);
      alert("Uspešno poslato!");
    } catch (err) {
      console.error(" Greška pri slanju odgovora:", err);
      alert("Greška prilikom slanja odgovora.");
    }
  };

  if (loading) return <p className="forms-loading">Učitavanje forme...</p>;
  if (!form || !form.name) return <p className="forms-empty">Forma nije pronađena.</p>;

  return (
    <div className="forms-container">
      <h2 className="forms-title">{form.name}</h2>
      <p className="form-card-desc">{form.description}</p>

      <div className="forms-grid">
        {form.questions?.length > 0 ? (
          form.questions.map((q, idx) => {
            console.log(` Pitanje ${idx + 1}:`, q);
            const currentValue = answers[q.id] || "";

            return (
              <div key={q.id || idx} className="form-card">
                <strong>Pitanje {idx + 1}:</strong>
                <p>{q.text}{q.is_required && <span style={{ color: "red" }}> *</span>}</p>

                {q.image_url && (
                  <img
                    src={q.image_url}
                    alt="slika pitanja"
                    style={{ maxWidth: "100%", margin: "10px 0", borderRadius: "6px" }}
                  />
                )}

                {q.type === "short_text" && (
                  <>
                    <input
                      type="text"
                      placeholder="Odgovor..."
                      value={currentValue}
                      onChange={(e) => {
                        if (e.target.value.length > 512) {
                          alert("Odgovor može imati najviše 512 karaktera.");
                          return;
                        }
                        handleAnswerChange(q.id, e.target.value);
                      }}
                    />
                    <small>{currentValue.length}/512 karaktera</small>
                  </>
                )}

                {q.type === "long_text" && (
                  <>
                    <textarea
                      placeholder="Odgovor..."
                      value={currentValue}
                      onChange={(e) => {
                        if (e.target.value.length > 4096) {
                          alert("Odgovor može imati najviše 4096 karaktera.");
                          return;
                        }
                        handleAnswerChange(q.id, e.target.value);
                      }}
                    />
                    <small>{currentValue.length}/4096 karaktera</small>
                  </>
                )}

                {(q.type === "radio" || q.type === "single_choice") && (
                  <>
                    {(!q.options || q.options.length === 0) ? (
                      <p style={{ color: "red" }}>⚠️ Nema ponuđenih opcija za ovo pitanje.</p>
                    ) : (
                      q.options.map((opt, i) => (
                        <label key={i} style={{ display: "block", marginBottom: "10px" }}>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={opt.text}
                            checked={answers[q.id] === opt.text}
                            onChange={() => handleAnswerChange(q.id, opt.text)}
                          />
                          {opt.text}
                          {opt.image_url && (
                            <img
                              src={opt.image_url}
                              alt={`Opcija ${i + 1}`}
                              style={{ display: "block", marginTop: "5px", maxWidth: "150px", borderRadius: "6px" }}
                            />
                          )}
                        </label>
                      ))
                    )}
                  </>
                )}
                {(q.type === "checkbox" || q.type === "multiple_choice") && (
                  <>
                    {console.log(` [Checkbox] Pitanje ${q.id} opcije:`, q.options)}
                    {(!q.options || q.options.length === 0) ? (
                      <p style={{ color: "red" }}>⚠️ Nema ponuđenih opcija za ovo pitanje.</p>
                    ) : (
                      q.options.map((opt, i) => {
                        const current = answers[q.id] || [];
                        const value = opt.text || opt;
                        const checked = current.includes(value);
                        const max = q.max_choices || Infinity;

                        return (
                          <label key={i} style={{ display: "block", marginBottom: "10px" }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (current.length >= max) {
                                    alert(`Možete izabrati najviše ${max} odgovora.`);
                                    return;
                                  }
                                  handleAnswerChange(q.id, [...current, value]);
                                } else {
                                  handleAnswerChange(q.id, current.filter((v) => v !== value));
                                }
                              }}
                            />
                            {value}
                            {opt.image_url && (
                              <img
                                src={opt.image_url}
                                alt={`Opcija ${i + 1}`}
                                style={{ display: "block", marginTop: "5px", maxWidth: "150px", borderRadius: "6px" }}
                              />
                            )}
                          </label>
                        );
                      })
                    )}
                  </>
                )}
              </div>
            );
          })
        ) : (
          <p className="forms-empty">Ova forma nema pitanja.</p>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button className="form-button" onClick={handleSubmit}>
          Pošalji odgovore
        </button>
      </div>
    </div>
  );
};

export default FillFormPage;
