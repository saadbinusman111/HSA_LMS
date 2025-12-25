import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

export default function FeeManager() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [year, setYear] = useState(new Date().getFullYear());
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && month && year) {
      fetchFees();
    }
  }, [selectedClass, month, year]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get('/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/fees/${selectedClass}/${month}/${year}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const exportToExcel = () => {
    if (!selectedClass || students.length === 0) return alert('No data to export');
    
    const className = classes.find(c => c.id == selectedClass)?.className || 'Class';
    
    // Force Left Alignment by converting numbers to strings
    const dataToExport = students.map((s, index) => ({
      'Sr No.': (index + 1).toString(),
      'Student Name': s.fullName.toUpperCase(),
      'Fee Amount (PKR)': (s.amount || 0).toString(),
      'Payment Status': (s.feeStatus || 'PENDING').toUpperCase(),
      'Billing Month': month.toString(),
      'Year': year.toString(),
      'Class/Batch': className.toString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    const wscols = [
      { wch: 10 }, { wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 25 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fee Report");
    XLSX.writeFile(workbook, `Fee_Report_${className}_${month}_${year}.xlsx`);
  };

  const handleFeeUpdate = async (studentId, amount, status) => {
    try {
      await axios.post('/api/fees/mark', {
        studentId, month, year, amount, status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Fee updated successfully');
      fetchFees();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Failed to update fee');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="title" style={{ marginBottom: 0 }}>Fee Management</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportToExcel} style={{ background: '#2e7d32', padding: '10px 20px', fontSize: '14px' }}>📥 Export Excel</button>
          <button onClick={() => navigate(-1)} style={{ background: '#555', padding: '10px 20px', fontSize: '14px' }}>&larr; Go Back</button>
        </div>
      </div>
      
      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%' }}>
              <option value="">-- Select --</option>
              {classes.map(cls => ( <option key={cls.id} value={cls.id}>{cls.className}</option> ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Month</label>
            <select value={month} onChange={e => setMonth(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%' }}>
              {months.map(m => ( <option key={m} value={m}>{m}</option> ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Year</label>
            <input type="number" value={year} onChange={e => setYear(e.target.value)} style={{ padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%' }} />
          </div>
        </div>
      </div>

      {message && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>{message}</div>}

      {selectedClass ? (
        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Fee Amount (PKR)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? ( <tr><td colSpan="4" style={{ textAlign: 'center' }}>Loading...</td></tr> ) : students.length === 0 ? ( <tr><td colSpan="4" style={{ textAlign: 'center' }}>No students found.</td></tr> ) : students.map(student => (
                <tr key={student.id}>
                  <td>{student.fullName}</td>
                  <td>
                    <input 
                      type="number" 
                      defaultValue={student.amount || 5000} 
                      id={`amount-${student.id}`}
                      style={{ padding: '8px', width: '100px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                  </td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      background: student.feeStatus === 'paid' ? '#e8f5e9' : '#fff3e0',
                      color: student.feeStatus === 'paid' ? '#2e7d32' : '#e65100'
                    }}>
                      {student.feeStatus.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {student.feeStatus === 'pending' ? (
                      <button 
                        onClick={() => handleFeeUpdate(student.id, document.getElementById(`amount-${student.id}`).value, 'paid')}
                        style={{ padding: '6px 12px', fontSize: '12px', background: '#2e7d32' }}
                      >
                        Mark as Paid
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleFeeUpdate(student.id, document.getElementById(`amount-${student.id}`).value, 'pending')}
                        style={{ padding: '6px 12px', fontSize: '12px', background: '#d32f2f' }}
                      >
                        Revert to Pending
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Please select a class to manage fees.</div>
      )}
    </div>
  );
}
