import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar({ role }) {
  return (
    <div className="sidebar">
      <div className="sidebar-menu">
        <Link to={role === 'teacher' ? '/teacher' : '/student'} className="menu-item">Dashboard</Link>
        
        {role === 'teacher' && (
          <>
            <Link to="/teacher/classes" className="menu-item">Manage Classes</Link>
            <Link to="/teacher/students" className="menu-item">Manage Students</Link>
            <Link to="/teacher/attendance" className="menu-item">Mark Attendance (Class)</Link>
            <Link to="/teacher/attendance-global" className="menu-item">Master Attendance (All)</Link>
            <Link to="/teacher/attendance-history" className="menu-item">Attendance History</Link>
            <Link to="/teacher/fees" className="menu-item">Manage Fees</Link>
            <Link to="/teacher/fees-history" className="menu-item">Fee History</Link>
            <Link to="/teacher/results" className="menu-item">Upload Results</Link>
            <Link to="/teacher/result-history" className="menu-item">Result History</Link>
          </>
        )}

        {role === 'student' && (
          <>
            <Link to="/student/classes" className="menu-item">My Classes</Link>
            <Link to="/student/assignments" className="menu-item">My Assignments</Link>
            <Link to="/student/attendance" className="menu-item">Attendance History</Link>
            <Link to="/student/fees" className="menu-item">Fee History</Link>
            <Link to="/student/results" className="menu-item">My Results</Link>
          </>
        )}

        <Link to="/settings" className="menu-item">Settings</Link>
      </div>

      <style>{`
        .sidebar {
          width: 260px;
          background: white;
          height: calc(100vh - 100px);
          padding: 20px;
          box-shadow: 4px 0 15px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          overflow-y: auto;
        }

        /* Custom Scrollbar for Sidebar */
        .sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
        .sidebar::-webkit-scrollbar-thumb:hover {
          background: #1565C0;
        }

        .sidebar-menu {
          flex: 1;
        }

        .menu-item {
          display: block;
          padding: 15px;
          margin-bottom: 10px;
          color: #555;
          text-decoration: none;
          border-radius: 8px;
          transition: 0.3s;
        }
        .menu-item:hover {
          background: #f0f7ff;
          color: #0a58ca;
        }
      `}</style>
    </div>
  );
}
