import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('/api/student/classes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClasses(res.data);
      } catch (err) { console.error(err); }
    };
    fetchClasses();
  }, []);

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="title" style={{ margin: 0 }}>My Enrolled Classes</div>
        <button onClick={() => navigate(-1)} style={{ background: '#555', padding: '8px 20px', fontSize: '14px' }}>&larr; Go Back</button>
      </div>
      <div className="cards">
        {classes.length === 0 ? <p>No classes enrolled.</p> : classes.map(cls => (
          <div key={cls.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{cls.className}</h3>
              <span style={{ background: cls.type === 'online' ? '#e3f2fd' : '#e8f5e9', color: cls.type === 'online' ? '#1565C0' : '#2e7d32', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{cls.type.toUpperCase()}</span>
            </div>
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>📅 {cls.schedule}</p>
            <p style={{ fontSize: '14px', color: '#555' }}>👥 {cls.totalStudents} Classmates</p>
            <Link to={`/class/${cls.id}`} style={{ display: 'block', marginTop: '15px', textAlign: 'center', background: '#1565C0', color: 'white', textDecoration: 'none', fontWeight: 'bold', padding: '10px', borderRadius: '8px' }}>Go to Classroom</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
