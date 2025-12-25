import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

export default function ResultManager() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [testInfo, setTestInfo] = useState({ testName: '', totalMarks: 100, testDate: new Date().toISOString().split('T')[0] });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchStudents();
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get('/api/classes', { headers: { Authorization: `Bearer ${token}` } });
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/classes/${selectedClass}`, { headers: { Authorization: `Bearer ${token}` } });
      const studentData = res.data.Users.map(u => ({ studentId: u.id, fullName: u.fullName, obtainedMarks: '', remarks: '' }));
      setStudents(studentData);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const exportToExcel = () => {
    if (!selectedClass || students.length === 0) return alert('No data to export');
    
    const className = classes.find(c => c.id == selectedClass)?.className || 'Class';
    
    // Force Left Alignment
    const dataToExport = students.map((s, index) => ({
      'Sr No.': (index + 1).toString(),
      'Student Name': s.fullName.toUpperCase(),
      'Obtained Marks': (s.obtainedMarks || 0).toString(),
      'Total Marks': testInfo.totalMarks.toString(),
      'Percentage (%)': s.obtainedMarks ? `${Math.round((s.obtainedMarks / testInfo.totalMarks) * 100)}%` : '0%',
      'Teacher Remarks': (s.remarks || 'GOOD').toUpperCase(),
      'Test Name': testInfo.testName.toString(),
      'Date': testInfo.testDate.toString(),
      'Class': className.toString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    const wscols = [
      { wch: 8 }, { wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 40 }, { wch: 25 }, { wch: 15 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Test Results");
    XLSX.writeFile(workbook, `Result_Report_${testInfo.testName}_${className}.xlsx`);
  };

  const handleMarkChange = (studentId, field, value) => {
    setStudents(students.map(s => s.studentId === studentId ? { ...s, [field]: value } : s));
  };

  const uploadResults = async () => {
    if (!testInfo.testName || !selectedClass) return alert('Fill test name and select class');
    try {
      await axios.post('/api/results/upload', { ...testInfo, classId: selectedClass, resultsData: students }, { headers: { Authorization: `Bearer ${token}` } });
      setMessage('Results uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { alert('Failed to upload'); }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="title" style={{ marginBottom: 0 }}>Upload Test Results</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportToExcel} style={{ background: '#2e7d32', padding: '10px 20px', fontSize: '14px' }}>📥 Export Excel</button>
          <button onClick={() => navigate(-1)} style={{ background: '#555', padding: '10px 20px', fontSize: '14px' }}>&larr; Go Back</button>
        </div>
      </div>
      
      <div className="card" style={{ marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Test Name</label>
            <input placeholder="e.g., Midterm Exam" value={testInfo.testName} onChange={e => setTestInfo({...testInfo, testName: e.target.value})} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Total Marks</label>
            <input type="number" value={testInfo.totalMarks} onChange={e => setTestInfo({...testInfo, totalMarks: e.target.value})} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Test Date</label>
            <input type="date" value={testInfo.testDate} onChange={e => setTestInfo({...testInfo, testDate: e.target.value})} />
          </div>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%' }}>
              <option value="">-- Select --</option>
              {classes.map(cls => ( <option key={cls.id} value={cls.id}>{cls.className}</option> ))}
            </select>
          </div>
        </div>
      </div>

      {message && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>{message}</div>}

      {selectedClass && (
        <div className="table-box">
          <table>
            <thead>
              <tr><th>Student Name</th><th>Obtained Marks</th><th>Remarks</th></tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.studentId}>
                  <td style={{ fontWeight: 'bold' }}>{s.fullName}</td>
                  <td><input type="number" value={s.obtainedMarks} onChange={e => handleMarkChange(s.studentId, 'obtainedMarks', e.target.value)} style={{ padding: '8px', width: '100px' }} /></td>
                  <td><input placeholder="Optional remarks" value={s.remarks} onChange={e => handleMarkChange(s.studentId, 'remarks', e.target.value)} style={{ padding: '8px' }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={uploadResults} style={{ marginTop: '20px', width: '100%' }}>Upload All Results</button>
        </div>
      )}
    </div>
  );
}
