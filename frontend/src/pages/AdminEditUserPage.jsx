import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function AdminEditUserPage() {
  const { userId } = useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSuper, setIsSuper] = useState(false);
  const [err, setErr] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [isSuperadmin, setIsSuperadmin] = useState(false);

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

        // pokušaj direktnog GET /users/{id}; ako ne postoji, padni na /users pa find
        try {
          const ures = await api.get(`/users/${userId}`);
          const u = ures.data;
          setUsername(u.username || "");
          setEmail(u.email || "");
          setIsSuperadmin(!!u.is_superadmin);
        } catch {
          const listRes = await api.get("/users");
          const u = (listRes.data || []).find((x) => String(x.id) === String(userId));
          if (u) {
            setUsername(u.username || "");
            setEmail(u.email || "");
            setIsSuperadmin(!!u.is_superadmin);
          }
        }
      } catch (e) {
        setErr("Greška pri čitanju korisnika.");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleSave = async () => {
    try {
      const body = {
        username,
        email,
        is_superadmin: isSuperadmin,
      };
      if (password.trim().length > 0) body.password = password;

      await api.put(`/users/${userId}`, body);
      alert("Nalog je ažuriran.");
      nav("/admin/users");
    } catch (e) {
      const s = e?.response?.status;
      if (s === 400) alert("Proverite unete podatke (min 2 znaka…).");
      else if (s === 403) alert("Nemate pravo izmene.");
      else alert("Greška pri ažuriranju naloga.");
    }
  };

  if (loading) return <p className="forms-loading">Učitavanje…</p>;
  if (!isSuper) return <p className="forms-empty">{err || "Zabranjen pristup."}</p>;

  return (
    <div className="form-container" style={{ maxWidth: 560 }}>
      <h2>Izmeni nalog #{userId}</h2>

      <div className="input-group">
        <label>Korisničko ime</label>
        <input className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div className="input-group">
        <label>Email</label>
        <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="input-group">
        <label>Nova lozinka (opciono)</label>
        <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className="form-row inline">
        <label className="muted" htmlFor="sup">Super admin</label>
        <label className="switch">
          <input id="sup" type="checkbox" checked={isSuperadmin} onChange={(e) => setIsSuperadmin(e.target.checked)} />
          <span className="slider" />
        </label>
      </div>

      <div className="actions-col">
        <button className="form-button" onClick={handleSave}>Sačuvaj</button>
      </div>
    </div>
  );
}
