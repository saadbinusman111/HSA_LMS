import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function ClassManager() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [newClass, setNewClass] = useState({ className: '', schedule: '', type: 'offline' });
  const [selectedStudent, setSelectedStudent] = useState({});
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get('/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) { console.error(err); }
  };

  // --- NEW: Remove Student Function ---
  const handleRemoveStudent = async (classId, userId) => {
    if (!window.confirm("Are you sure you want to remove this student from this class?")) return;

    try {
      await axios.delete(`/api/classes/${classId}/students/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Student removed successfully");
      fetchClasses(); // Refresh the list
    } catch (err) {
      alert("Failed to remove student");
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post('/api/classes', newClass, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClasses();
      setNewClass({ className: '', schedule: '', type: 'offline' });
    } catch (err) { alert('Error creating class'); }
  };

  const handleEnroll = async (classId) => {
    const studentId = selectedStudent[classId];
    if (!studentId) return alert('Select a student');

    try {
      await axios.post('/api/enroll', { classId, studentId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Enrolled!');
      fetchClasses();
    } catch (err) { alert('Enrollment failed'); }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      await axios.delete(`/api/classes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setClasses(classes.filter(c => c.id !== id));
      alert("Class deleted");
    } catch (err) { alert("Failed to delete class"); }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="title">Class Management</div>
        <button onClick={() => navigate(-1)} style={{ background: '#555' }}>&larr; Go Back</button>
      </div>
      
      <div className="cards">
        {classes.map(cls => (
          <div key={cls.id} className="card" style={{ marginBottom: '20px' }}>
            <h3>{cls.className} ({cls.type})</h3>
            
            {/* List students with Remove buttons */}
            <div style={{ margin: '15px 0' }}>
              <strong>Enrolled Students:</strong>
              {cls.Users && cls.Users.map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #eee' }}>
                  {u.fullName}
                  <button 
                    className="btn-remove"
                    onClick={() => handleRemoveStudent(cls.id, u.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
              <Link 
                to={`/class/${cls.id}`} 
                style={{ 
                  display: 'block', 
                  marginBottom: '10px', 
                  textAlign: 'center', 
                  background: '#1565C0', 
                  color: 'white', 
                  textDecoration: 'none', 
                  fontWeight: 'bold', 
                  padding: '10px', 
                  borderRadius: '8px' 
                }}
              >
                Manage Content & Assignments
              </Link>
              <select onChange={(e) => setSelectedStudent({ ...selectedStudent, [cls.id]: e.target.value })} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '100%', marginBottom: '10px' }}>
                <option value="">Add Student</option>
                {students.map(s => ( <option key={s.id} value={s.id}>{s.fullName}</option> ))}
              </select>
              <button onClick={() => handleEnroll(cls.id)} style={{ width: '100%' }}>Add Student to Class</button>
            </div>
            <button onClick={() => handleDeleteClass(cls.id)} style={{ background: '#d32f2f', marginTop: '10px', width: '100%' }}>Delete Entire Class</button>
          </div>
        ))}
      </div>
    </div>
  );
}
