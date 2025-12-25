import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass && date) {
      fetchAttendance();
    }
  }, [selectedClass, date]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get('/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/attendance/${selectedClass}/${date}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const exportToExcel = () => {
    if (!selectedClass || students.length === 0) return alert('No data to export');
    
    const className = classes.find(c => c.id == selectedClass)?.className || 'Class';
    
    // Convert all values to strings to force LEFT alignment in Excel
    const dataToExport = students.map((s, index) => ({
      'Sr No.': (index + 1).toString(),
      'Student Name': s.fullName.toUpperCase(),
      'Attendance Status': (s.status || 'NOT MARKED').toUpperCase(),
      'Date': date.toString(),
      'Class/Batch': className.toString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    const wscols = [
      { wch: 10 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 20 },
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");
    XLSX.writeFile(workbook, `Attendance_Report_${className}_${date}.xlsx`);
  };

  const handleStatusChange = (studentId, status) => {
    const updatedStudents = students.map(s => 
      s.id === studentId ? { ...s, status } : s
    );
    setStudents(updatedStudents);
  };

  const saveAttendance = async () => {
    const attendanceData = students
      .filter(s => s.status !== null)
      .map(s => ({ studentId: s.id, status: s.status }));

    if (attendanceData.length === 0) return alert('No attendance marked to save');

    try {
      await axios.post('/api/attendance/mark', {
        classId: selectedClass,
        date,
        attendanceData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Attendance saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert('Failed to save attendance');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="title" style={{ marginBottom: 0 }}>Class Attendance</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportToExcel} style={{ background: '#2e7d32', padding: '10px 20px', fontSize: '14px' }}>📥 Export Excel</button>
          <button onClick={() => navigate(-1)} style={{ background: '#555', padding: '10px 20px', fontSize: '14px' }}>&larr; Go Back</button>
        </div>
      </div>
      
      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '20px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Class</label>
            <select 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%' }}
            >
              <option value="">-- Select a Class --</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.className}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Select Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              style={{ padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', background: '#fff' }}
            />
          </div>

          <button 
            onClick={saveAttendance}
            style={{ padding: '12px 30px', height: 'fit-content' }}
          >
            Save Attendance
          </button>
        </div>
      </div>

      {message && (
        <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid #c8e6c9', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      {selectedClass ? (
        <div className="table-box">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '15px' }}>Student Name</th>
                <th style={{ padding: '15px', textAlign: 'center' }}>Mark Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>No students enrolled.</td></tr>
              ) : students.map(student => (
                <tr key={student.id}>
                  <td style={{ padding: '15px', fontWeight: '600' }}>{student.fullName}</td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleStatusChange(student.id, 'present')}
                        style={{ 
                          background: student.status === 'present' ? '#2e7d32' : '#e8f5e9', 
                          color: student.status === 'present' ? 'white' : '#2e7d32',
                          border: '2px solid #2e7d32',
                          padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
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
                          padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
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
                          padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold',
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
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Please select a class to mark attendance.
        </div>
      )}
    </div>
  );
}
