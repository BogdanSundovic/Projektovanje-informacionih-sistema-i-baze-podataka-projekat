import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/form.css";

const PublicFormsPage = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/forms/public") // ako backend vec filtrira
      .then((res) => {
        if (Array.isArray(res.data)) {
          setForms(res.data);
        } else {
          console.error("Neočekivan format:", res.data);
        }
      })
      .catch((err) => {
        console.error("Greška prilikom dohvatanja javnih formi:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="forms-loading">Učitavanje...</p>;
  const norm = (s) =>
    (s || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // skini dijakritike
      .toLowerCase()
      .trim();

  const filtered = forms.filter((f) => norm(f.name).includes(norm(search)));


  return (
    <div className="forms-container">
      <h2 className="forms-title">Javne Forme</h2>
      <div className="forms-search">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pretraži po nazivu…"
          className="input-field"
        />
      </div>
      {forms.length === 0 ? (
        <p className="forms-empty">Trenutno nema javnih formi.</p>
      ) : filtered.length === 0 ? (
        <p className="forms-empty">Nema rezultata za “{search}”.</p>
      ) : (
        <div className="forms-grid">
          {filtered.map((form) => (
            <div key={form.id} className="form-card">
              <h3 className="form-card-title">{form.name}</h3>
              <p className="form-card-desc">{form.description}</p>
              <button
                className="form-button"
                onClick={() => navigate(`/form/view/${form.id}`)}
              >
                Ispuni
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicFormsPage;
