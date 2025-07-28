import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleMyFormsClick = () => {
    navigate("/my-forms");
  };

  const handleCreateFormClick = () => {
    navigate("/create-form");
  };

  return (
    <div className="dashboard-container" style={styles.container}>
      <h1 style={styles.title}>Dobrodošao na Dashboard</h1>

      <div style={styles.buttonContainer}>
        <button onClick={handleMyFormsClick} style={styles.button}>
          Moje Forme
        </button>
        <button onClick={handleCreateFormClick} style={styles.button}>
          Kreiraj Novu Formu
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "2rem",
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "2rem",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    alignItems: "center",
  },
  button: {
    padding: "1rem 2rem",
    fontSize: "1rem",
    backgroundColor: "#2e86de",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default DashboardPage;
