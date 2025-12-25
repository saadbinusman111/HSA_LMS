import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function MyAssignments() {
  const [assignments, setAssignments] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get('/api/student/assignments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAssignments(res.data);
      } catch (err) { console.error(err); }
    };
    fetchAssignments();
  }, []);

  const getStatusColor = (status) => {
    if (status === 'graded') return '#2e7d32'; // Green
    if (status === 'submitted') return '#1565C0'; // Blue
    return '#f57c00'; // Orange
  };

  return (
    <div className="container">
      <div className="title">My Assignments Timeline</div>
      
      {assignments.length === 0 ? <div className="card">No pending assignments! 🎉</div> : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {assignments.map(assign => (
            <div key={assign.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', background: '#eee', padding: '4px 8px', borderRadius: '4px' }}>{assign.className}</span>
                <h3 style={{ margin: '8px 0' }}>{assign.title}</h3>
                <p style={{ fontSize: '14px', color: '#666' }}>Due: {new Date(assign.dueDate).toLocaleDateString()}</p>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  color: 'white', 
                  fontWeight: 'bold', 
                  fontSize: '12px',
                  marginBottom: '10px',
                  background: getStatusColor(assign.status)
                }}>
                  {assign.status.toUpperCase()}
                </div>
                {assign.marks && <div style={{ fontWeight: 'bold', color: '#2e7d32' }}>Score: {assign.marks}</div>}
                
                <Link to={`/class/${assign.classId}`} style={{ display: 'block', color: '#1565C0', textDecoration: 'none', fontSize: '14px', marginTop: '5px' }}>
                  View Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
