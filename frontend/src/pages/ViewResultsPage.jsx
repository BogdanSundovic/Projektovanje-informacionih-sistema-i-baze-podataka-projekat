// src/pages/ViewResultsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import api from "../services/api";

function ViewResultsPage() {
  const { id } = useParams();
  const location = useLocation();

  const asUser = new URLSearchParams(location.search).get('as_user');
  const withParams = (cfg = {}) => ({
    ...cfg,
    params: asUser ? { ...(cfg.params || {}), as_user: asUser } : (cfg.params || {}),
  });

  const [results, setResults] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);

  // NEW: filter state
  const [selectedQuestion, setSelectedQuestion] = useState(""); // "" = sva pitanja
  const [selectedUser, setSelectedUser] = useState("");         // "" = svi korisnici

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/forms/${id}/answers`, withParams());
        setResults(res.data || []);
      } catch (err) {
        console.error('Greška pri dohvaćanju rezultata:', err);
        alert('Greška pri dohvaćanju rezultata.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id, asUser]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const resp = await api.get(`/forms/${id}/export.xlsx`, withParams({
        responseType: "blob",
      }));

      const blob = new Blob([resp.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form_${id}_odgovori.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error("Greška pri izvozu:", e);
      alert(e?.response?.status === 403 ? "Nemate dozvolu za izvoz." : "Došlo je do greške pri izvozu.");
    } finally {
      setExporting(false);
    }
  };

  // NEW: izvuci jedinstvena pitanja i korisnike iz rezultata
  const { questionsList, usersList } = useMemo(() => {
    const qSet = new Set();
    const uSet = new Set();
    for (const r of results) {
      if (r?.pitanje != null && String(r.pitanje).trim() !== "") qSet.add(String(r.pitanje));
      if (r?.korisnik != null && String(r.korisnik).trim() !== "") uSet.add(String(r.korisnik));
    }
    return {
      questionsList: Array.from(qSet).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
      usersList: Array.from(uSet).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })),
    };
  }, [results]);

  // NEW: primeni filtere
  const filteredResults = useMemo(() => {
    return results.filter((entry) => {
      const byQ = selectedQuestion ? entry.pitanje === selectedQuestion : true;
      const byU = selectedUser ? entry.korisnik === selectedUser : true;
      return byQ && byU;
    });
  }, [results, selectedQuestion, selectedUser]);

  const clearFilters = () => {
    setSelectedQuestion("");
    setSelectedUser("");
  };

  return (
    <div className="container">
      <h2 className="forms-title">Rezultati forme</h2>

      {/* Export */}
      <div className="actions-col" style={{ marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <button className="form-button" onClick={handleExport} disabled={exporting}>
          {exporting ? "Pripremam izvoz…" : "Izvezi u Excel"}
        </button>

        {/* NEW: Filteri */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
            marginLeft: 'auto'
          }}
        >
          <label className="muted" htmlFor="filter-question">Pitanje</label>
          <select
            id="filter-question"
            className="input-field"
            value={selectedQuestion}
            onChange={(e) => setSelectedQuestion(e.target.value)}
            style={{ minWidth: 220 }}
          >
            <option value="">Sva pitanja</option>
            {questionsList.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>

          <label className="muted" htmlFor="filter-user">Korisnik</label>
          <select
            id="filter-user"
            className="input-field"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{ minWidth: 220 }}
          >
            <option value="">Svi korisnici</option>
            {usersList.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>

          {(selectedQuestion || selectedUser) && (
            <button className="form-button" onClick={clearFilters} type="button">
              Resetuj filtere
            </button>
          )}
        </div>
      </div>

      {/* Info bar */}
      {(selectedQuestion || selectedUser) && (
        <div
          className="muted"
          style={{ marginBottom: 12, fontSize: 14 }}
        >
          Prikazano: <strong>{filteredResults.length}</strong> od <strong>{results.length}</strong> zapisa
          {selectedQuestion && <> • Pitanje: <em>{selectedQuestion}</em></>}
          {selectedUser && <> • Korisnik: <em>{selectedUser}</em></>}
        </div>
      )}

      {/* Loading / Empty / List */}
      {loading ? (
        <p className="forms-loading">Učitavanje…</p>
      ) : (results.length === 0 ? (
        <p className="forms-empty">Nema unetih odgovora.</p>
      ) : (
        filteredResults.length === 0 ? (
          <p className="forms-empty">Nema rezultata za izabrani filter.</p>
        ) : (
          filteredResults.map((entry, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: "1rem",
                padding: "1rem",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                background: "var(--surface)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <p><strong>Pitanje:</strong> {entry.pitanje}</p>
              <p><strong>Odgovor:</strong> {Array.isArray(entry.odgovor) ? entry.odgovor.join(" | ") : entry.odgovor}</p>
              <p><strong>Korisnik:</strong> {entry.korisnik}</p>
            </div>
          ))
        )
      ))}
    </div>
  );
}

export default ViewResultsPage;
