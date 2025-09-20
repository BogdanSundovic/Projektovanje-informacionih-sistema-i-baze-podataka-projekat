// src/pages/FillFormPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import api from "../services/api";
import "../styles/form.css";

const FillFormPage = () => {
  const { id } = useParams();
  const location = useLocation();

  // ?as_user=123 (za super admin impersonaciju)
  const asUser = new URLSearchParams(location.search).get("as_user");
  const withParams = (cfg = {}) => ({
    ...cfg,
    params: asUser ? { ...(cfg.params || {}), as_user: asUser } : (cfg.params || {}),
  });

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/forms/${id}`, withParams());
        setForm(res.data);
      } catch (err) {
        console.error("Greška pri dohvatanju forme:", err?.response?.status, err?.response?.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, asUser]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // --- NEW: helper za brojčane liste, radi i bez q.options ---
  const makeNumericList = (q) => {
    // 1) Ako BE vraća options (tekstovi brojeva)
    if (q?.options?.length) {
      return q.options
        .map((o) => Number(o?.text))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);
    }
    // 2) list mod
    if (q?.numeric_mode === "list" && Array.isArray(q?.numeric_values)) {
      return q.numeric_values
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);
    }
    // 3) range mod
    if (q?.numeric_mode === "range" && q?.numeric_scale) {
      let { start, end, step } = q.numeric_scale;
      start = Number(start); end = Number(end); step = Number(step);
      if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(step) || step === 0) return [];
      // korekcija smera
      if (start < end && step < 0) step = Math.abs(step);
      if (start > end && step > 0) step = -Math.abs(step);
      const out = [];
      for (let x = start; (step > 0 ? x <= end : x >= end); x += step) out.push(x);
      return out;
    }
    return [];
  };

  const handleSubmit = async () => {
    if (!form) return;

    if (form.is_locked) {
      alert("Ova forma je zaključana; slanje odgovora je onemogućeno.");
      return;
    }

    // Validacija obaveznih pitanja
    for (const q of form.questions || []) {
      const val = answers[q.id];

      if (q.is_required) {
        // tekstualna
        if ((q.type === "short_text" || q.type === "long_text") && (!val || String(val).trim() === "")) {
          alert(`Pitanje "${q.text}" je obavezno.`);
          return;
        }
        // single / numeric / date / datetime
        if (
          (q.type === "radio" ||
            q.type === "single_choice" ||
            q.type === "numeric_choice" ||
            q.type === "date" ||
            q.type === "datetime") &&
          (val === undefined || val === null || String(val).trim?.() === "")
        ) {
          alert(`Pitanje "${q.text}" je obavezno.`);
          return;
        }
        // multiple
        if ((q.type === "checkbox" || q.type === "multiple_choice") && (!val || val.length === 0)) {
          alert(`Pitanje "${q.text}" je obavezno.`);
          return;
        }
      }

      // meka validacija formata
      if (val && q.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(String(val))) {
        alert(`Datum kod pitanja "${q.text}" mora biti u formatu YYYY-MM-DD.`);
        return;
      }
      if (val && q.type === "datetime" &&
          !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(?:\.\d{1,3})?)?(Z|[+\-]\d{2}:\d{2})?$/.test(String(val))) {
        alert(`Datum i vreme kod pitanja "${q.text}" mora biti validan ISO format (npr. 2025-09-04T14:30).`);
        return;
      }
      if (val != null && q.type === "numeric_choice" && !Number.isFinite(Number(val))) {
        alert(`Odgovor kod pitanja "${q.text}" mora biti broj.`);
        return;
      }
    }

    const payload = {
      answers: Object.entries(answers).map(([question_id, answer]) => ({
        question_id: Number(question_id),
        // za numeric_choice pošalji number, inače ostavi kako jeste
        answer: typeof answer === "string" && Number.isFinite(Number(answer)) ? Number(answer) : answer,
      })),
    };

    try {
      await api.post(`/forms/${id}/answers`, payload, withParams());
      alert("Uspešno poslato!");
    } catch (err) {
      console.error("Greška pri slanju odgovora:", err);
      alert("Greška prilikom slanja odgovora.");
    }
  };

  if (loading) return <p className="forms-loading">Učitavanje forme...</p>;
  if (!form || !form.name) return <p className="forms-empty">Forma nije pronađena.</p>;

  return (
    <div className="forms-container">
      <h2 className="forms-title">
        {form.name}{" "}
        {form.is_locked && <span className="badge badge-lock">Zaključana</span>}
      </h2>
      <p className="form-card-desc">{form.description}</p>

      {form.is_locked && (
        <p className="forms-empty" style={{ marginBottom: 16 }}>
          Ova forma je zaključana; popunjavanje je trenutno onemogućeno.
        </p>
      )}

      <div className="forms-grid">
        {form.questions?.length > 0 ? (
          form.questions.map((q, idx) => {
            const currentValue =
              answers[q.id] ??
              ((q.type === "multiple_choice" || q.type === "checkbox") ? [] : "");

            return (
              <div key={q.id || idx} className="form-card">
                <strong>Pitanje {idx + 1}:</strong>
                <p>
                  {q.text}
                  {q.is_required && <span style={{ color: "red" }}> *</span>}
                </p>

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
                      disabled={form.is_locked}
                      onChange={(e) => {
                        if (e.target.value.length > 512) {
                          alert("Odgovor može imati najviše 512 karaktera.");
                          return;
                        }
                        handleAnswerChange(q.id, e.target.value);
                      }}
                    />
                    <small>{String(currentValue).length}/512 karaktera</small>
                  </>
                )}

                {q.type === "long_text" && (
                  <>
                    <textarea
                      placeholder="Odgovor..."
                      value={currentValue}
                      disabled={form.is_locked}
                      onChange={(e) => {
                        if (e.target.value.length > 4096) {
                          alert("Odgovor može imati najviše 4096 karaktera.");
                          return;
                        }
                        handleAnswerChange(q.id, e.target.value);
                      }}
                    />
                    <small>{String(currentValue).length}/4096 karaktera</small>
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
                            disabled={form.is_locked}
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
                              disabled={form.is_locked}
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
                    {Number.isFinite(q.max_choices) && q.max_choices > 0 && (
                      <small>Maksimalno izbora: {q.max_choices}</small>
                    )}
                  </>
                )}

                {/* NEW: NUMERIC CHOICE */}
                {q.type === "numeric_choice" && (
                  <>
                    {makeNumericList(q).length === 0 ? (
                      <p style={{ color: "red" }}>⚠️ Nema definisanih numeričkih vrednosti za ovo pitanje.</p>
                    ) : (
                      <select
                        value={answers[q.id] ?? ""}
                        disabled={form.is_locked}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value === "" ? "" : Number(e.target.value))}
                      >
                        <option value="" disabled>— izaberite vrednost —</option>
                        {makeNumericList(q).map((num, i) => (
                          <option key={i} value={num}>{num}</option>
                        ))}
                      </select>
                    )}
                    <small>Izaberite jedan broj iz liste.</small>
                  </>
                )}

                {/* NEW: DATE */}
                {q.type === "date" && (
                  <>
                    <input
                      type="date"
                      value={answers[q.id] ?? ""}
                      disabled={form.is_locked}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                    <small>Format: YYYY-MM-DD</small>
                  </>
                )}

                {/* NEW: DATETIME */}
                {q.type === "datetime" && (
                  <>
                    <input
                      type="datetime-local"
                      value={answers[q.id] ?? ""}
                      disabled={form.is_locked}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                    <small>Npr. 2025-09-04T14:30</small>
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
        <button className="form-button" onClick={handleSubmit} disabled={!!form.is_locked}>
          Pošalji odgovore
        </button>
      </div>
    </div>
  );
};

export default FillFormPage;
