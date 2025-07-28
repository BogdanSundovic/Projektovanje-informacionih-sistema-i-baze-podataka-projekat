import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';


function ViewResultsPage() {
  const { id } = useParams();
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/forms/${id}/answers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(" Rezultati sa servera:", res.data); 
        setResults(res.data);
      } catch (err) {
        console.error('Greška pri dohvaćanju rezultata:', err);
      }
    };
    fetchResults();
  }, [id]);

  return (
  <div>
    <h2>Rezultati forme</h2>
    {results.length === 0 ? (
      <p>Nema unetih odgovora.</p>
    ) : (
      results.map((entry, idx) => (
        <div key={idx} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <p><strong>Pitanje:</strong> {entry.pitanje}</p>
          <p><strong>Odgovor:</strong> {entry.odgovor}</p>
          <p><strong>Korisnik:</strong> {entry.korisnik}</p>
        </div>
        ))
      )}
    </div>
  );
}

export default ViewResultsPage;
