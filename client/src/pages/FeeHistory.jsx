import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

export default function FeeHistory() {
  const [fees, setFees] = useState([]);
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
      const res = await axios.get('/api/fees-history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFees(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const exportToExcel = () => {
    if (fees.length === 0) return alert('No data to export');
    
    const dataToExport = fees.map((f, index) => ({
      'Sr No.': (index + 1).toString(),
      'Student Name': f.User?.fullName?.toUpperCase() || 'N/A',
      'Username': f.User?.username || 'N/A',
      'Amount (PKR)': (f.amount || 0).toString(),
      'Status': (f.status || 'PENDING').toUpperCase(),
      'Month': f.month.toUpperCase(),
      'Year': f.year.toString(),
      'Paid Date': f.paidDate ? new Date(f.paidDate).toLocaleDateString() : 'NOT PAID'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [
      { wch: 10 }, { wch: 35 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 20 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fee History");
    XLSX.writeFile(workbook, "HSA_LMS_Complete_Fee_History.xlsx");
  };

  const filtered = fees.filter(f => 
    f.User?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.year.toString().includes(searchTerm)
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="title" style={{ marginBottom: 0 }}>Fee History</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportToExcel} style={{ background: '#2e7d32', padding: '10px 20px', fontSize: '14px' }}>📥 Export History</button>
          <button onClick={() => navigate(-1)} style={{ background: '#555', padding: '10px 20px', fontSize: '14px' }}>&larr; Go Back</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '30px' }}>
        <input 
          placeholder="Search by student name, month, or year..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '12px', borderRadius: '8px', border: '2px solid #eceef1', width: '100%', background: '#fff' }}
        />
      </div>

      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Month/Year</th>
              <th>Student Name</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Paid On</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
            ) : filtered.map(f => (
              <tr key={f.id}>
                <td style={{ fontSize: '14px', fontWeight: '600' }}>{f.month} {f.year}</td>
                <td style={{ fontWeight: 'bold' }}>{f.User?.fullName}</td>
                <td>PKR {f.amount}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    background: f.status === 'paid' ? '#e8f5e9' : '#fff3e0',
                    color: f.status === 'paid' ? '#2e7d32' : '#e65100'
                  }}>
                    {f.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ fontSize: '13px', color: '#666' }}>{f.paidDate ? new Date(f.paidDate).toLocaleDateString() : '--'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
