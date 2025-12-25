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
    if (!window.confirm("Are you sure you want to delete this class? This will delete all associated data (assignments, materials, attendance, etc.) permanently.")) return;

    try {
      await axios.delete(`/api/classes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove from state immediately
      setClasses(classes.filter(c => c.id !== id));
      alert("Class deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to delete class");
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="title" style={{ margin: 0 }}>Class Management</div>
        <button onClick={() => navigate(-1)} style={{ background: '#555', padding: '8px 20px', fontSize: '14px' }}>&larr; Go Back</button>
      </div>
      
      <div className="card" style={{ marginBottom: '30px' }}>
        <h3>Create New Class</h3>
        <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr 1fr auto' }}>
          <input placeholder="Class Name" value={newClass.className} onChange={e => setNewClass({...newClass, className: e.target.value})} />
          <input placeholder="Schedule" value={newClass.schedule} onChange={e => setNewClass({...newClass, schedule: e.target.value})} />
          <select value={newClass.type} onChange={e => setNewClass({...newClass, type: e.target.value})} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </select>
          <button onClick={handleCreate}>Create</button>
        </div>
      </div>

      <div className="cards">
        {classes.map(cls => (
          <div key={cls.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{cls.className}</h3>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ background: '#eee', padding: '5px 10px', borderRadius: '4px', fontSize: '12px' }}>{cls.type}</span>
                <button 
                  onClick={() => handleDeleteClass(cls.id)} 
                  style={{ background: '#d32f2f', padding: '5px 10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', marginTop: 0 }}
                >
                  Delete
                </button>
              </div>
            </div>
            <p style={{ margin: '10px 0', color: '#666' }}>{cls.schedule}</p>
            <p><strong>Students Enrolled:</strong> {cls.Users ? cls.Users.length : 0}</p>
            <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              <label style={{ fontSize: '12px' }}>Enroll Student:</label>
              <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                <select style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} onChange={(e) => setSelectedStudent({ ...selectedStudent, [cls.id]: e.target.value })}>
                  <option value="">Select Student</option>
                  {students.map(s => ( <option key={s.id} value={s.id}>{s.fullName} ({s.username})</option> ))}
                </select>
                <button onClick={() => handleEnroll(cls.id)} style={{ padding: '8px 15px', marginTop: 0 }}>Add</button>
              </div>
            </div>
            <Link to={`/class/${cls.id}`} style={{ display: 'block', marginTop: '15px', textAlign: 'center', color: '#0a58ca', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #0a58ca', padding: '8px', borderRadius: '6px' }}>Manage Content</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
