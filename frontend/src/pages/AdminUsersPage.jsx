// src/pages/AdminUsersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminUsersPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSuper, setIsSuper] = useState(false);
  const [users, setUsers] = useState([]);
  const [err, setErr] = useState("");

  // search
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const me = await api.get("/me");
        if (!me.data?.is_superadmin) {
          setIsSuper(false);
          setErr("Nemate pravo pristupa (super admin samo).");
          setLoading(false);
          return;
        }
        setIsSuper(true);

        const res = await api.get("/users"); // [{id, username, email, is_superadmin}]
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setErr("Greška pri učitavanju korisnika.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!debounced) return users;
    return users.filter((u) => {
      const a = (u.username || "").toLowerCase();
      const b = (u.email || "").toLowerCase();
      return a.includes(debounced) || b.includes(debounced);
    });
  }, [users, debounced]);

  const handleDelete = async (u) => {
    if (!window.confirm(`Obrisati korisnika "${u.username}"?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      setUsers((list) => list.filter((x) => x.id !== u.id));
      alert("Korisnik obrisan.");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 409) {
        alert("Ne možete obrisati poslednjeg super admina.");
      } else if (status === 403) {
        alert("Nemate pravo da obrišete ovog korisnika.");
      } else {
        alert("Greška pri brisanju korisnika.");
      }
    }
  };

  if (loading) return <p className="forms-loading">Učitavanje…</p>;
  if (!isSuper) return <p className="forms-empty">{err || "Zabranjen pristup."}</p>;

  return (
    <div className="forms-container">
      <h2 className="forms-title">Korisnici</h2>

      <div className="input-group" style={{ maxWidth: 520, margin: "0 auto 16px" }}>
        <label>Pretraži (ime ili email)</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
          <input
            className="input-field"
            placeholder="npr. ana ili ana@firma.com"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="btn-ghost" onClick={() => setQuery("")} title="Obriši pretragu">
              ✕
            </button>
          )}
        </div>
        <small className="muted">
          Prikazano {filtered.length} / {users.length}
        </small>
      </div>

      {filtered.length === 0 ? (
        <p className="forms-empty">Nema rezultata za “{query}”.</p>
      ) : (
        <div className="forms-grid">
          {filtered.map((u) => (
            <div key={u.id} className="form-card">
              <div>
                <div className="form-card-title">
                  {u.username}{" "}
                  {u.is_superadmin && <span className="badge">super admin</span>}
                </div>
                <div className="form-card-desc">{u.email}</div>
              </div>

              <div className="actions-col">
                <button className="form-button" onClick={() => nav(`/admin/users/${u.id}/forms`)}>
                  Forme
                </button>
                <button className="form-button" onClick={() => nav(`/admin/users/${u.id}/edit`)}>
                  Izmeni nalog
                </button>
                <button
                  className="form-button"
                  style={{ backgroundColor: "#dc3545" }}
                  onClick={() => handleDelete(u)}
                >
                  Obriši korisnika
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
