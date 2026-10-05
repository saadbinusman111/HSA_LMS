import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function CourseView() {
  const { id } = useParams(); // class ID from URL
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('students'); // content, assignments, discussion, students
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (activeTab === 'students') {
      fetchEnrolledStudents();
    }
  }, [id, activeTab]);

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/classes/${id}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- FIXED: Function to Preview or Download Student Result Card PDF ---
  const handleFetchResultCard = async (studentId, isDownload = false) => {
    try {
      // 1. Fetch PDF binary stream with responseType: 'blob'
      const response = await axios.get(`/api/report/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // CRITICAL: Prevents 404/Parsing errors on binary files
      });

      // 2. Create local Blob URL
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = window.URL.createObjectURL(blob);

      if (isDownload) {
        // Trigger file download
        const link = document.createElement('a');
        link.href = fileURL;
        link.setAttribute('download', `ResultCard_Student_${studentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Preview PDF in a new browser tab
        window.open(fileURL, '_blank');
      }
    } catch (error) {
      console.error("Error loading result card:", error);
      alert("Could not load result card PDF. Please ensure the backend endpoint /api/report exists.");
    }
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Content Hub</h2>
        <button onClick={() => navigate(-1)} style={{ background: '#555', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
          &larr; Go Back
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('content')} 
          style={{ padding: '10px 20px', background: activeTab === 'content' ? '#1565C0' : '#f0f0f0', color: activeTab === 'content' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Content
        </button>
        <button 
          onClick={() => setActiveTab('assignments')} 
          style={{ padding: '10px 20px', background: activeTab === 'assignments' ? '#1565C0' : '#f0f0f0', color: activeTab === 'assignments' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Assignments
        </button>
        <button 
          onClick={() => setActiveTab('discussion')} 
          style={{ padding: '10px 20px', background: activeTab === 'discussion' ? '#1565C0' : '#f0f0f0', color: activeTab === 'discussion' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Discussion
        </button>
        <button 
          onClick={() => setActiveTab('students')} 
          style={{ padding: '10px 20px', background: activeTab === 'students' ? '#1565C0' : '#f0f0f0', color: activeTab === 'students' ? '#fff' : '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Students
        </button>
      </div>

      {/* Students Tab View */}
      {activeTab === 'students' && (
        <div className="card" style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Enrolled Students</h3>
          {loading ? (
            <p>Loading students...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px' }}>NAME</th>
                  <th style={{ padding: '12px' }}>USERNAME</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>RESULT CARD</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '12px' }}>{student.fullName || student.name}</td>
                    <td style={{ padding: '12px' }}>{student.username}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleFetchResultCard(student.id, false)}
                          style={{ padding: '6px 12px', background: '#e0e0e0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Preview Result Card
                        </button>
                        <button 
                          onClick={() => handleFetchResultCard(student.id, true)}
                          style={{ padding: '6px 12px', background: '#e0e0e0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Download as PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No enrolled students found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
