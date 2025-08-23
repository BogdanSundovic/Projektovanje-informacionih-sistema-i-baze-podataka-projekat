// src/pages/ViewResultsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

function ViewResultsPage() {
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [exportingXlsx, setExportingXlsx] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/forms/${id}/answers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data || []);
      } catch (err) {
        console.error("Greška pri dohvaćanju rezultata:", err);
        alert("Greška pri dohvaćanju rezultata.");
      }
    };
    fetchResults();
  }, [id]);

  // Backend XLSX (trenutno: definicija pitanja)
  const handleExportXlsx = async () => {
    setExportingXlsx(true);
    try {
      const token = localStorage.getItem("token");
      const resp = await api.get(`/forms/${id}/export.xlsx`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const blob = new Blob([resp.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form_${id}_definicija.xlsx`; // jasniji naziv
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error("Greška pri izvozu XLSX:", e);
      alert(e?.response?.status === 403 ? "Nemate dozvolu za izvoz." : "Došlo je do greške pri izvozu.");
    } finally {
      setExportingXlsx(false);
    }
  };

  // FE CSV iz answers (Pitanje, Odgovor, Korisnik)
  const handleExportCSV = () => {
    const rows = [
      ["Pitanje", "Odgovor", "Korisnik"],
      ...results.map((r) => {
        // odgovor može biti niz -> spoji " | "
        const ans =
          Array.isArray(r.odgovor)
            ? r.odgovor.join(" | ")
            : (r.odgovor ?? "");
        return [r.pitanje ?? "", String(ans), r.korisnik ?? ""];
      }),
    ];

    // CSV escaping
    const escape = (val) =>
      `"${String(val).replace(/"/g, '""')}"`;

    const csv = "\uFEFF" + rows.map((row) => row.map(escape).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `form_${id}_odgovori.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="container">
      <h2 className="forms-title">Rezultati forme</h2>

      <div className="actions-col" style={{ marginBottom: 16 }}>
        <button
          className="form-button"
          onClick={handleExportCSV}
          title="Preuzmi CSV sa odgovorima"
        >
          Izvezi odgovore (CSV)
        </button>
      </div>

      {results.length === 0 ? (
        <p className="forms-empty">Nema unetih odgovora.</p>
      ) : (
        results.map((entry, idx) => (
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
      )}
    </div>
  );
}

export default ViewResultsPage;
