import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TeacherDashboard({ user }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    monthlyFees: 0,
    attendanceRate: 0,
    recentAttendance: []
  });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/teacher/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <div className="container">Loading Dashboard...</div>;

  return (
    <div className="container">
      <div className="title">Teacher Dashboard - Welcome, {user?.fullName}</div>
      
      <div className="cards">
        <div className="card">
          <h3>Total Students</h3>
          <p>{stats.totalStudents}</p>
        </div>
        <div className="card">
          <h3>Total Classes</h3>
          <p>{stats.totalClasses}</p>
        </div>
        <div className="card">
          <h3>Fees Collected</h3>
          <p style={{ fontSize: '22px' }}>PKR {stats.monthlyFees.toLocaleString()}</p>
        </div>
        <div className="card">
          <h3>Avg. Attendance</h3>
          <p>{stats.attendanceRate}%</p>
        </div>
      </div>

      <div className="table-box">
        <h3>Recent Student Activity (Attendance)</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Class</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentAttendance.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>No recent activity found.</td></tr>
            ) : (
              stats.recentAttendance.map((record) => (
                <tr key={record.id}>
                  <td>{record.User?.fullName}</td>
                  <td>{record.resolvedClassName}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      background: record.status === 'present' ? '#e8f5e9' : (record.status === 'absent' ? '#ffebee' : '#fff3e0'),
                      color: record.status === 'present' ? '#2e7d32' : (record.status === 'absent' ? '#c62828' : '#e65100')
                    }}>
                      {record.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
