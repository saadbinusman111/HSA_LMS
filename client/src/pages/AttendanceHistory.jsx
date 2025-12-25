import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

export default function AttendanceHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/attendance-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const exportToExcel = () => {
    if (history.length === 0) return alert('No data to export');
    
    const dataToExport = history.map((h, index) => ({
      'Sr No.': (index + 1).toString(),
      'Student Name': h.User?.fullName?.toUpperCase() || 'N/A',
      'Username': h.User?.username || 'N/A',
      'Status': (h.status || 'N/A').toUpperCase(),
      'Date': h.date.toString(),
      'Class': (h.resolvedClassName || 'NOT ENROLLED').toUpperCase()
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [
      { wch: 10 }, { wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 25 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance History");
    XLSX.writeFile(workbook, "HSA_LMS_Attendance_Master_History.xlsx");
  };

  const filtered = history.filter(h => 
    h.User?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    h.resolvedClassName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.date.includes(searchTerm)
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="title" style={{ marginBottom: 0 }}>Attendance History</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportToExcel} style={{ background: '#2e7d32', padding: '10px 20px', fontSize: '14px' }}>📥 Export History</button>
          <button onClick={() => navigate(-1)} style={{ background: '#555', padding: '10px 20px', fontSize: '14px' }}>&larr; Go Back</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '30px' }}>
        <input 
          placeholder="Search by student name, class, or date (YYYY-MM-DD)..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '2px solid #eceef1', width: '100%', background: '#fff' }}
        />
      </div>

      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
            ) : filtered.map(h => (
              <tr key={h.id}>
                <td>{h.date}</td>
                <td style={{ fontWeight: 'bold' }}>{h.User?.fullName}</td>
                <td>{h.resolvedClassName}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
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
