import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

export default function GlobalAttendance() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGlobalAttendance();
  }, [date]);

  const fetchGlobalAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/attendance-global/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const exportToExcel = () => {
    if (students.length === 0) return alert('No data to export');
    
    // Force Left Alignment
    const dataToExport = students.map((s, index) => ({
      'Sr No.': (index + 1).toString(),
      'Student Name': s.fullName.toUpperCase(),
      'Username': `@${s.username}`,
      'Status': (s.status || 'NOT MARKED').toUpperCase(),
      'Date': date.toString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    const wscols = [
      { wch: 10 }, { wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 15 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Master Attendance");
    XLSX.writeFile(workbook, `Master_Attendance_Report_${date}.xlsx`);
  };

  const handleStatusChange = (studentId, status) => {
    const updatedStudents = students.map(s => 
      s.id === studentId ? { ...s, status } : s
    );
    setStudents(updatedStudents);
  };

  const saveGlobalAttendance = async () => {
    const attendanceData = students
      .filter(s => s.status !== null)
      .map(s => ({ studentId: s.id, status: s.status }));

    if (attendanceData.length === 0) return alert('No attendance marked to save');

    try {
      await axios.post('/api/attendance/mark-global', {
        date,
        attendanceData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Global attendance saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Failed to save attendance');
    }
  };

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="title" style={{ marginBottom: 0 }}>Master Attendance (All Students)</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportToExcel} style={{ background: '#2e7d32', padding: '10px 20px', fontSize: '14px' }}>📥 Export Excel</button>
          <button onClick={() => navigate(-1)} style={{ background: '#555', padding: '10px 20px', fontSize: '14px' }}>&larr; Go Back</button>
        </div>
      </div>
      
      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '20px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              style={{ padding: '11px', borderRadius: '8px', border: '2px solid #eceef1', width: '100%', background: '#fff' }}
            />
          </div>
          
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Search Student</label>
            <input 
              placeholder="Search by name or username..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '11px', borderRadius: '8px', border: '2px solid #eceef1', width: '100%', background: '#fff' }}
            />
          </div>

          <button 
            onClick={saveGlobalAttendance}
            style={{ padding: '12px 30px', height: 'fit-content' }}
          >
            Save All
          </button>
        </div>
      </div>

      {message && (
        <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid #c8e6c9', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      <div className="table-box">
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '15px' }}>Student Name</th>
              <th style={{ padding: '15px' }}>Username</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Mark Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No students found.</td></tr>
            ) : filteredStudents.map(student => (
              <tr key={student.id}>
                <td style={{ padding: '15px', fontWeight: 'bold', color: '#333' }}>{student.fullName}</td>
                <td style={{ padding: '15px', color: '#666' }}>{student.username}</td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => handleStatusChange(student.id, 'present')}
                      style={{ 
                        background: student.status === 'present' ? '#2e7d32' : '#e8f5e9', 
                        color: student.status === 'present' ? 'white' : '#2e7d32',
                        border: '2px solid #2e7d32',
                        padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', minWidth: '100px',
                        transition: '0.3s'
                      }}
                    >
                      PRESENT
                    </button>
                    <button 
                      onClick={() => handleStatusChange(student.id, 'absent')}
                      style={{ 
                        background: student.status === 'absent' ? '#d32f2f' : '#ffebee', 
                        color: student.status === 'absent' ? 'white' : '#d32f2f',
                        border: '2px solid #d32f2f',
                        padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', minWidth: '100px',
                        transition: '0.3s'
                      }}
                    >
                      ABSENT
                    </button>
                    <button 
                      onClick={() => handleStatusChange(student.id, 'leave')}
                      style={{ 
                        background: student.status === 'leave' ? '#f57c00' : '#fff3e0', 
                        color: student.status === 'leave' ? 'white' : '#f57c00',
                        border: '2px solid #f57c00',
                        padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', minWidth: '100px',
                        transition: '0.3s'
                      }}
                    >
                      LEAVE
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
