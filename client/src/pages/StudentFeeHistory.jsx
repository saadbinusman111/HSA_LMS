import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function StudentFeeHistory() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/student/fees', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFees(res.data);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchHistory();
  }, [token]);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="title" style={{ margin: 0 }}>My Fee History</div>
        <button onClick={() => navigate(-1)} style={{ background: '#555', padding: '8px 20px', fontSize: '14px' }}>&larr; Go Back</button>
      </div>

      <div className="cards">
        {loading ? <p>Loading fees...</p> : fees.length === 0 ? <p>No fee records found.</p> : fees.map(f => (
          <div key={f.id} className="card" style={{ borderLeft: f.status === 'paid' ? '5px solid #2e7d32' : '5px solid #e65100' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, color: '#333' }}>{f.month} {f.year}</h3>
                <p style={{ marginTop: '5px', fontSize: '18px', fontWeight: 'bold', color: '#1565C0' }}>PKR {f.amount.toLocaleString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ 
                  padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                  background: f.status === 'paid' ? '#e8f5e9' : '#fff3e0',
                  color: f.status === 'paid' ? '#2e7d32' : '#e65100',
                  display: 'inline-block'
                }}>
                  {f.status.toUpperCase()}
                </span>
                {f.paidDate && <p style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>Paid on: {new Date(f.paidDate).toLocaleDateString()}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
