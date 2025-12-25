import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentDashboard({ user }) {
  const [stats, setStats] = useState({ classes: 0, assignments: 0, attendance: 0, pendingFees: 0 });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clsRes, assRes, attRes, feeRes] = await Promise.all([
          axios.get('/api/student/classes', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/student/assignments', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/student/attendance', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/student/fees', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const pendingAssignments = assRes.data.filter(a => a.status === 'pending').length;
        
        // Find current month's fee
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const currentYear = new Date().getFullYear();
        const currentFee = feeRes.data.find(f => f.month === currentMonth && f.year === currentYear);
        const pendingFeeAmount = currentFee && currentFee.status === 'paid' ? 0 : (currentFee ? currentFee.amount : 5000);

        setStats({
          classes: clsRes.data.length,
          assignments: pendingAssignments,
          attendance: attRes.data.summary.percentage,
          pendingFees: pendingFeeAmount
        });
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      <div className="title">Student Dashboard - Welcome, {user?.fullName}</div>
      
      <div className="cards">
        <div className="card">
          <h3>Enrolled Classes</h3>
          <p>{stats.classes}</p>
        </div>
        <div className="card">
          <h3>Pending Assignments</h3>
          <p style={{ color: stats.assignments > 0 ? '#d32f2f' : '#2e7d32' }}>{stats.assignments}</p>
        </div>
        <div className="card">
          <h3>Current Month Fee</h3>
          <p style={{ color: stats.pendingFees > 0 ? '#d32f2f' : '#2e7d32' }}>
            {stats.pendingFees > 0 ? `PKR ${stats.pendingFees}` : 'PAID'}
          </p>
        </div>
        <div className="card">
          <h3>Attendance</h3>
          <p style={{ color: stats.attendance < 75 ? '#d32f2f' : '#2e7d32' }}>{stats.attendance}%</p>
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card" style={{ background: '#e3f2fd', border: '1px solid #90caf9' }}>
          <h3>📢 Latest Announcement</h3>
          <p style={{ fontSize: '16px', fontWeight: 'normal', marginTop: '10px' }}>
            Welcome to the new LMS portal! Check your assignments tab for upcoming deadlines.
          </p>
        </div>
        
        <div className="card">
          <h3>🚀 Quick Actions</h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <a href="/student/assignments" style={{ textDecoration: 'none', background: '#1565C0', color: 'white', padding: '10px', borderRadius: '6px', fontSize: '14px' }}>View Assignments</a>
            <a href="/student/classes" style={{ textDecoration: 'none', background: '#fff', border: '1px solid #1565C0', color: '#1565C0', padding: '10px', borderRadius: '6px', fontSize: '14px' }}>Go to Classes</a>
          </div>
        </div>
      </div>
    </div>
  );
}
