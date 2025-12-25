import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function StudentManager() {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ fullName: '', username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post('/api/register-student', newStudent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
      setNewStudent({ fullName: '', username: '', password: '' });
      alert('Student Registered Successfully');
    } catch (err) {
      alert('Error registering student');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    try {
      await axios.delete(`/api/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleResetPassword = async (id) => {
    const newPass = window.prompt('Enter new password for student:');
    if (!newPass) return;
    try {
      await axios.post(`/api/students/${id}/reset-password`, { newPassword: newPass }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Password reset successfully');
    } catch (err) {
      alert('Failed to reset');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="title" style={{ marginBottom: 0 }}>Student Management</div>
        <button onClick={() => navigate(-1)} style={{ background: '#555', padding: '10px 20px', fontSize: '14px' }}>&larr; Go Back</button>
      </div>

      <div className="card" style={{ marginBottom: '30px' }}>
        <h3>Register New Student</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Only students created here can access the LMS.</p>
        <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr 1fr auto' }}>
          <input 
            placeholder="Full Name" 
            value={newStudent.fullName} 
            onChange={e => setNewStudent({...newStudent, fullName: e.target.value})}
          />
          <input 
            placeholder="Username" 
            value={newStudent.username} 
            onChange={e => setNewStudent({...newStudent, username: e.target.value})}
          />
          <div style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password" 
              value={newStudent.password} 
              style={{ paddingRight: '40px' }}
              onChange={e => setNewStudent({...newStudent, password: e.target.value})}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', width: 'auto', padding: '5px' }}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          <button onClick={handleRegister}>Register</button>
        </div>
      </div>

      <div className="table-box">
        <h3>Registered Students</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(std => (
              <tr key={std.id}>
                <td>{std.fullName}</td>
                <td>{std.username}</td>
                <td>
                  <button onClick={() => handleResetPassword(std.id)} style={{ padding: '6px 10px', background: '#f57c00', fontSize: '12px', marginRight: '5px' }}>Reset Pass</button>
                  <button onClick={() => handleDelete(std.id)} style={{ padding: '6px 10px', background: '#d32f2f', fontSize: '12px' }}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
