import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function StudentAttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/student/attendance', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data.records);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchHistory();
  }, [token]);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="title" style={{ margin: 0 }}>My Attendance History</div>
        <button onClick={() => navigate(-1)} style={{ background: '#555', padding: '8px 20px', fontSize: '14px' }}>&larr; Go Back</button>
      </div>

      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Class</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : history.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
            ) : history.map(h => (
              <tr key={h.id}>
                <td style={{ fontWeight: '600' }}>{h.date}</td>
                <td>{h.Class?.className || 'Master Attendance'}</td>
                <td>
                  <span style={{ 
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                    background: h.status === 'present' ? '#e8f5e9' : (h.status === 'absent' ? '#ffebee' : '#fff3e0'),
                    color: h.status === 'present' ? '#2e7d32' : (h.status === 'absent' ? '#c62828' : '#e65100')
                  }}>
                    {h.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
