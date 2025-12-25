import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

export default function ResultHistory() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/results/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const exportToExcel = () => {
    if (results.length === 0) return alert('No data to export');
    
    const dataToExport = results.map((r, index) => ({
      'Sr No.': (index + 1).toString(),
      'Student Name': r.User?.fullName?.toUpperCase() || 'N/A',
      'Class': r.Class?.className?.toUpperCase() || 'N/A',
      'Test Name': r.testName.toUpperCase(),
      'Marks Obtained': r.obtainedMarks.toString(),
      'Total Marks': r.totalMarks.toString(),
      'Percentage (%)': `${Math.round((r.obtainedMarks / r.totalMarks) * 100)}%`,
      'Date': r.testDate,
      'Remarks': (r.remarks || 'GOOD').toUpperCase()
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [
      { wch: 8 }, { wch: 30 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }
    ];
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Full Result History");
    XLSX.writeFile(workbook, "HSA_LMS_Complete_Result_History.xlsx");
  };

  const handleUpdate = async () => {
    if (!currentResult) return;
    setError('');

    try {
      const res = await axios.put(`/api/results/${currentResult.id}`, currentResult, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setResults(results.map(r => r.id === currentResult.id ? res.data.result : r));
      setIsModalOpen(false);
      setCurrentResult(null);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update.');
    }
  };

  const openModal = (result) => {
    setCurrentResult({ ...result });
    setIsModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentResult(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentResult({ ...currentResult, [name]: value });
  };

  const filteredResults = results.filter(r => 
    r.User?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.Class?.className?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="title" style={{ marginBottom: 0 }}>Result History (All Students)</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={exportToExcel} style={{ background: '#2e7d32', padding: '10px 20px', fontSize: '14px' }}>📥 Export Full History</button>
          <button onClick={() => navigate(-1)} style={{ background: '#555', padding: '10px 20px', fontSize: '14px' }}>&larr; Go Back</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '30px' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Search Filter</label>
        <input 
          placeholder="Search by student name, test name, or class..."
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
              <th>Test Name</th>
              <th>Marks</th>
              <th>%</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Loading history...</td></tr>
            ) : filteredResults.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
            ) : filteredResults.map(r => (
              <tr key={r.id}>
                <td style={{ fontSize: '13px', color: '#666' }}>{r.testDate}</td>
                <td style={{ fontWeight: 'bold' }}>{r.User?.fullName}</td>
                <td style={{ fontSize: '14px' }}>{r.Class?.className}</td>
                <td style={{ color: '#1565C0', fontWeight: '600' }}>{r.testName}</td>
                <td style={{ fontWeight: 'bold' }}>{r.obtainedMarks} / {r.totalMarks}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    background: (r.obtainedMarks / r.totalMarks) >= 0.5 ? '#e8f5e9' : '#ffebee',
                    color: (r.obtainedMarks / r.totalMarks) >= 0.5 ? '#2e7d32' : '#c62828'
                  }}>
                    {Math.round((r.obtainedMarks / r.totalMarks) * 100)}%
                  </span>
                </td>
                <td>
                  <button onClick={() => openModal(r)} style={{ padding: '5px 10px', fontSize: '12px', background: '#1976d2' }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && currentResult && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }} onClick={closeModal}></div>
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '30px', borderRadius: '12px', zIndex: 1001, width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Edit Result for {currentResult.User.fullName}</h3>
            {error && <p style={{ color: 'red', background: '#ffebee', padding: '10px', borderRadius: '8px' }}>{error}</p>}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
              <div>
                <label>Test Name</label>
                <input name="testName" value={currentResult.testName} onChange={handleInputChange} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label>Obtained Marks</label>
                  <input type="number" name="obtainedMarks" value={currentResult.obtainedMarks} onChange={handleInputChange} />
                </div>
                <div>
                  <label>Total Marks</label>
                  <input type="number" name="totalMarks" value={currentResult.totalMarks} onChange={handleInputChange} />
                </div>
              </div>
              <div>
                <label>Remarks</label>
                <textarea name="remarks" value={currentResult.remarks || ''} onChange={handleInputChange} style={{ minHeight: '80px' }} />
              </div>
            </div>

            <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={closeModal} style={{ background: '#757575' }}>Cancel</button>
              <button onClick={handleUpdate} style={{ background: '#2e7d32' }}>Save Changes</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
