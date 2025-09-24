// src/pages/AdminUserFormsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { FaEdit, FaEye, FaList } from "react-icons/fa";

export default function AdminUserFormsPage() {
  const { userId } = useParams();
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSuper, setIsSuper] = useState(false);
  const [owner, setOwner] = useState(null);
  const [forms, setForms] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const me = await api.get("/me");
        if (!me.data?.is_superadmin) {
          setIsSuper(false);
          setErr("Nemate pravo pristupa (super admin samo).");
          setLoading(false);
          return;
        }
        setIsSuper(true);

        // ime korisnika (ako postoji GET /users/{id}, može i to)
        let users = [];
        try {
          const resUsers = await api.get("/users");
          users = Array.isArray(resUsers.data) ? resUsers.data : [];
        } catch {}
        setOwner(users.find((u) => String(u.id) === String(userId)) || null);

        // sve forme korisnika, uključujući kolaboracije
        const res = await api.get(`/users/${userId}/forms`, {
          params: { include_collab: true },
        });
        setForms(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setErr("Greška pri učitavanju formi korisnika.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) return <p className="forms-loading">Učitavanje…</p>;
  if (!isSuper) return <p className="forms-empty">{err || "Zabranjen pristup."}</p>;

  return (
    <div className="forms-container">
      <h2 className="forms-title">{owner ? owner.username : `Korisnik #${userId}`}</h2>

      {forms.length === 0 ? (
        <p className="forms-empty">Nema formi.</p>
      ) : (
        <div className="forms-grid">
          {forms.map((f) => (
            <div key={f.id} className="form-card">
              <h3 className="form-card-title">
                {f.name}
                {f.is_locked && <span className="badge badge-lock">Zaključana</span>}
              </h3>
              <p className="form-card-desc">{f.description || "—"}</p>

              <div className="actions-col">
                {/* PROSLEDI as_user SVUDA */}
                <button
                  className="form-button"
                  onClick={() => nav(`/form/edit/${f.id}?as_user=${userId}`)}
                >
                  <FaEdit /> Edituj
                </button>
                <button
                  className="form-button"
                  onClick={() => nav(`/form/view/${f.id}?as_user=${userId}`)}
                >
                  <FaEye /> Pregledaj
                </button>
                <button
                  className="form-button"
                  onClick={() => nav(`/form/results/${f.id}?as_user=${userId}`)}
                >
                  <FaList /> Vidi odgovore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
