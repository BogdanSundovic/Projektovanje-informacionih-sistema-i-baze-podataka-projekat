import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import "../styles/form.css"; 
import { FaEdit, FaEye, FaList } from "react-icons/fa";


const MyFormsPage = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("/forms/owned", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setForms(res.data.slice(0, 9));
        } else {
          console.error("Neispravan format podataka:", res.data);
        }
      })
      .catch((err) => console.error("Greška:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="forms-loading">Učitavanje...</p>;

  return (
    <div className="forms-container">
      <h2 className="forms-title">Moje Forme</h2>

      {forms.length === 0 ? (
        <p className="forms-empty">Nemaš nijednu formu.</p>
      ) : (
        <div className="forms-grid">
          {forms.map((form) => (
            <div key={form.id} className="form-card">
              <h3 className="form-card-title">{form.name}</h3>
              <p className="form-card-desc">{form.description}</p>
               <div className="form-actions">
                <button
                  className="form-button"
                  onClick={() => navigate(`/form/edit/${form.id}`)}
                >
                   <FaEdit /> Edituj
                </button>
                <button
                  className="form-button"
                  onClick={() => navigate(`/form/view/${form.id}`)}
                >
                  <FaEye /> Pregledaj
                </button>
                <button
                  className="form-button"
                  onClick={() => navigate(`/form/results/${form.id}`)}
                >
                  <FaList /> Vidi odgovore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {forms.length === 9 && (
        <div className="forms-view-all">
          <button
            className="form-button view-all"
            onClick={() => navigate("/forms")}
          >
            Pogledaj sve forme
          </button>
        </div>
      )}
    </div>
  );
};

export default MyFormsPage;
