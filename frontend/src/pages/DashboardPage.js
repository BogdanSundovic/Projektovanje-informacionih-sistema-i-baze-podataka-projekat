import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function DashboardPage() {
  const nav = useNavigate();
  const [isSuper, setIsSuper] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const me = await api.get("/me");            // GET /api/me
        setIsSuper(!!me.data?.is_superadmin);
      } catch {
        setIsSuper(false);
      }
    };
    run();
  }, []);

  return (
    <div className="container" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 className="forms-title">Dobrodošao na Dashboard</h1>

      <div className="actions-col">
        <button className="form-button" onClick={() => nav("/my-forms")}>
          Moje Forme
        </button>
        <button className="form-button" onClick={() => nav("/create-form")}>
          Kreiraj Novu Formu
        </button>

        {isSuper && (
          <button className="form-button" onClick={() => nav("/admin/users")}>
            Upravljaj korisnicima
          </button>
        )}
      </div>
    </div>
  );
}
