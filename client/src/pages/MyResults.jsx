import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MyResults() {
  const [results, setResults] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get('/api/student/results', { headers: { Authorization: `Bearer ${token}` } });
        setResults(res.data);
      } catch (err) { console.error(err); }
    };
    fetchResults();
  }, []);

  return (
    <div className="container">
      <div className="title">My Test Results</div>
      <div className="cards">
        {results.length === 0 ? <p>No results published yet.</p> : results.map(res => (
          <div key={res.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', background: '#e3f2fd', color: '#1565C0', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{res.Class?.className}</span>
              <span style={{ fontSize: '12px', color: '#666' }}>{new Date(res.testDate).toLocaleDateString()}</span>
            </div>
            <h3 style={{ margin: '15px 0' }}>{res.testName}</h3>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1565C0' }}>{res.obtainedMarks} / {res.totalMarks}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>Marks Obtained</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32' }}>{Math.round((res.obtainedMarks / res.totalMarks) * 100)}%</div>
                <div style={{ fontSize: '12px', color: '#888' }}>Percentage</div>
              </div>
            </div>
            {res.remarks && <p style={{ marginTop: '15px', fontStyle: 'italic', fontSize: '14px', color: '#555', borderTop: '1px solid #eee', paddingTop: '10px' }}>" {res.remarks} "</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
