import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function CollaboratorsPanel({ formId }) {
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const debouncedQ = useDebounced(query, 350);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);

  const load = async () => {
    setLoading(true);
    setForbidden(false);
    setError("");
    try {
      const res = await api.get(`/forms/${formId}/collaborators`);
      setCollabs(res.data || []);
    } catch (e) {
      if (e?.response?.status === 403) {
        setForbidden(true);
      } else {
        setError("Greška pri učitavanju kolaboratora.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  // search users (min 2 slova)
  useEffect(() => {
    const q = (debouncedQ || "").trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    (async () => {
      setSearching(true);
      setError("");
      try {
        const res = await api.get("/users/search", {
          params: { q, exclude_form_id: formId },
        });
        setResults(res.data || []);
      } catch (e) {
        if (e?.response?.status === 400) {
          setError("Unesite bar 2 karaktera.");
        } else if (e?.response?.status === 403) {
          setForbidden(true);
        } else {
          setError("Greška pri pretrazi korisnika.");
        }
      } finally {
        setSearching(false);
      }
    })();
  }, [debouncedQ, formId]);

  const addOrUpdate = async (userId, role) => {
    try {
      await api.post(`/forms/${formId}/collaborators`, {
        user_id: userId,
        role,
      });
      await load();
      setQuery("");
      setResults([]);
    } catch (e) {
      if (e?.response?.status === 403) {
        alert("Nemate dozvolu za ovu radnju.");
        setForbidden(true);
      } else {
        alert("Greška pri dodavanju/izmeni kolaboratora.");
      }
    }
  };

  const changeRole = async (userId, role) => {
    await addOrUpdate(userId, role);
  };

  const removeCollab = async (userId) => {
    if (!window.confirm("Ukloniti kolaboratora?")) return;
    try {
      await api.delete(`/forms/${formId}/collaborators/${userId}`);
      await load();
    } catch (e) {
      if (e?.response?.status === 403) {
        alert("Nemate dozvolu za ovu radnju.");
        setForbidden(true);
      } else {
        alert("Greška pri uklanjanju kolaboratora.");
      }
    }
  };

  if (forbidden) return null; // sakrij ceo tab ako nije owner

  return (
    <div className="collab-panel">
      <div className="collab-header">
        <h3>Kolaboratori</h3>
        <p className="muted">Samo vlasnik vidi i uređuje ovaj tab.</p>
      </div>

      {/* Search */}
      <div className="collab-search">
        <input
          type="text"
          className="input-field"
          placeholder="Pretraži korisnike (min 2 slova)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {searching && <div className="collab-hint muted">Pretraga…</div>}
        {error && <div className="collab-error">{error}</div>}

        {results.length > 0 && (
          <div className="collab-results">
            {results.map((u) => (
              <div key={u.id} className="collab-result-row">
                <div className="collab-user">
                  <div className="collab-name">{u.username}</div>
                  <div className="collab-email muted">{u.email}</div>
                </div>
                <div className="collab-actions">
                  <select
                    className="role-select"
                    defaultValue="viewer"
                    id={`add-role-${u.id}`}
                  >
                    <option value="viewer">viewer</option>
                    <option value="editor">editor</option>
                  </select>
                  <button
                    className="btn-ghost"
                    onClick={() =>
                      addOrUpdate(
                        u.id,
                        document.getElementById(`add-role-${u.id}`).value
                      )
                    }
                  >
                    Dodaj
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lista kolaboratora */}
      <div className="collab-list">
        {loading ? (
          <div className="muted">Učitavanje…</div>
        ) : collabs.length === 0 ? (
          <div className="muted">Nema kolaboratora.</div>
        ) : (
          collabs.map((c) => (
            <div key={c.user_id} className="collab-row">
              <div className="collab-user">
                <div className="collab-name">{c.username}</div>
                <div className="collab-email muted">{c.email}</div>
              </div>
              <div className="collab-actions">
                <select
                  className="role-select"
                  value={c.role}
                  onChange={(e) => changeRole(c.user_id, e.target.value)}
                >
                  <option value="viewer">viewer</option>
                  <option value="editor">editor</option>
                </select>
                <button
                  className="btn-ghost"
                  onClick={() => removeCollab(c.user_id)}
                  title="Ukloni"
                >
                  Ukloni
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
