// src/pages/MyFormsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/form.css";
import { FaEdit, FaEye, FaList } from "react-icons/fa";

const ROLE_EDIT = new Set(["owner", "editor", "admin"]);
const pickRole = (f) =>
  f?.my_role || f?.role || f?.collab_role || f?.membership_role || null;

const computeCanEditLocal = (f, fallbackRole) => {
  // 1) BE source of truth ako postoji
  if (f?.capabilities && typeof f.capabilities.can_edit === "boolean") {
    return f.capabilities.can_edit;
  }
  // 2) deriviraj iz role ako je imamo
  const r = String(pickRole(f) || fallbackRole || "").toLowerCase();
  return ROLE_EDIT.has(r);
};

const MyFormsPage = () => {
  const [owned, setOwned] = useState([]);
  const [collabs, setCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    (async () => {
      setLoading(true);
      setErr("");
      try {
        // 1) tvoje forme (owner)
        const ownedRes = await api.get("/forms/owned", { headers });
        const ownedArr = Array.isArray(ownedRes.data) ? ownedRes.data : [];
        // obeleži lokalno
        const ownedWithFlags = ownedArr.slice(0, 9).map((f) => ({
          ...f,
          __role: "owner",
          __canEdit: true,
        }));
        setOwned(ownedWithFlags);

        // 2) forme gde si owner ili kolaborator
        let mineArr = [];
        try {
          const mineRes = await api.get("/forms/mine", { headers });
          mineArr = Array.isArray(mineRes.data) ? mineRes.data : [];
        } catch (e) {
          console.warn("Ne mogu /forms/mine:", e?.response?.status || e);
        }

        // 3) kolaboracije = mine - owned
        const ownedIds = new Set(ownedArr.map((f) => f.id));
        const collabList = (mineArr || []).filter((f) => !ownedIds.has(f.id));

        // 4) obogati kolaboracije rodom/capabilities
        const enrichOne = async (f) => {
          let role = pickRole(f) || "viewer";
          let canEdit = computeCanEditLocal(f, role);

          // ako /forms/mine ne šalje ništa o pravima, povuci detalje forme
          if (f?.capabilities?.can_edit === undefined && !pickRole(f)) {
            try {
              const det = await api.get(`/forms/${f.id}`, { headers });
              const d = det.data || {};
              role = d.my_role || role;
              if (d.capabilities && typeof d.capabilities.can_edit === "boolean") {
                canEdit = d.capabilities.can_edit;
              } else {
                canEdit = computeCanEditLocal({ my_role: role }, role);
              }
            } catch (e) {
              console.warn(`GET /forms/${f.id} nije uspeo`, e?.response?.status || e);
              // konzervativno: bez prava za edit
              canEdit = false;
            }
          }

          return { ...f, __role: role, __canEdit: !!canEdit };
        };

        const collabEnriched = await Promise.all(collabList.map(enrichOne));
        setCollabs(collabEnriched);
      } catch (e) {
        console.error("Greška:", e);
        setErr("Greška pri učitavanju formi.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="forms-loading">Učitavanje...</p>;
  if (err) return <p className="forms-empty">{err}</p>;

  const Card = ({ form }) => (
    <div key={form.id} className="form-card">
      <h3 className="form-card-title">
        {form.name}
        {form.is_locked && <span className="badge badge-lock">Zaključana</span>}
        {form.__role && <span className="badge" style={{ marginLeft: 6 }}>{form.__role}</span>}
      </h3>
      <p className="form-card-desc">{form.description || "—"}</p>
      <div className="form-actions">
        {form.__canEdit && (
          <button className="form-button" onClick={() => navigate(`/form/edit/${form.id}`)}>
            <FaEdit /> Edituj
          </button>
        )}
        <button className="form-button" onClick={() => navigate(`/form/view/${form.id}`)}>
          <FaEye /> Pregledaj
        </button>
        <button className="form-button" onClick={() => navigate(`/form/results/${form.id}`)}>
          <FaList /> Vidi odgovore
        </button>
      </div>
    </div>
  );

  const showNothing = owned.length === 0 && collabs.length === 0;

  return (
    <div className="forms-container">
      <h2 className="forms-title">Moje Forme</h2>

      {showNothing ? (
        <p className="forms-empty">Nemaš nijednu formu.</p>
      ) : (
        <>
          {/* Moje (owner) */}
          {owned.length > 0 && (
            <div className="forms-grid">
              {owned.map((form) => <Card key={form.id} form={form} />)}
            </div>
          )}

          {/* Kolaboracije */}
          {collabs.length > 0 && (
            <>
              <h2 className="forms-title" style={{ marginTop: 32 }}>Kolaboracije</h2>
              <div className="forms-grid">
                {collabs.map((form) => <Card key={form.id} form={form} />)}
              </div>
            </>
          )}
        </>
      )}

      {owned.length === 9 && (
        <div className="forms-view-all">
          <button className="form-button view-all" onClick={() => navigate("/forms")}>
            Pogledaj sve forme
          </button>
        </div>
      )}
    </div>
  );
};

export default MyFormsPage;
