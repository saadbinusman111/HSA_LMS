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

  // --- NEW: Remove Student Function with Security Warning ---
  const handleRemoveStudent = async (classId, userId) => {
    const warningMessage = `⚠️ SECURITY WARNING: IMPORTANT NOTE\n\n` +
      `Are you sure you want to delete this student?\n\n` +
      `By proceeding, the following will happen:\n` +
      `1. This student will be PERMANENTLY deleted from the entire LMS.\n` +
      `2. ALL of their Attendance records will be DELETED.\n` +
      `3. ALL of their Fee payment records will be DELETED.\n` +
      `4. ALL of their Exam Results will be DELETED.\n` +
      `5. They will be removed from the Student Management tab.\n\n` +
      `This action CANNOT BE UNDONE. Do you still want to delete all their data?`;

    if (!window.confirm(warningMessage)) return;

    try {
      await axios.delete(`/api/classes/${classId}/students/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Student and all associated records have been permanently deleted.");
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

      {/* Class Creation Form Card */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h3>Create New Class</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Enter the details below to create a new class/batch.</p>
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>CLASS NAME</label>
            <input 
              placeholder="e.g. Class 10 Chemistry" 
              value={newClass.className} 
              onChange={e => setNewClass({...newClass, className: e.target.value})}
              style={{ padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', background: '#fff' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>SCHEDULE</label>
            <input 
              placeholder="e.g. Mon, Wed, Fri - 10:00 AM" 
              value={newClass.schedule} 
              onChange={e => setNewClass({...newClass, schedule: e.target.value})}
              style={{ padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', background: '#fff' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>TYPE</label>
            <select 
              value={newClass.type} 
              onChange={e => setNewClass({...newClass, type: e.target.value})}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e0', width: '100%', background: '#fff' }}
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
          </div>
          <button onClick={handleCreate} style={{ padding: '12px 30px', height: 'fit-content' }}>Create Class</button>
        </div>
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
