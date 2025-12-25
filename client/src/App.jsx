import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ClassManager from "./pages/ClassManager";
import StudentManager from "./pages/StudentManager";
import CourseView from "./pages/CourseView";
import MyClasses from "./pages/MyClasses";
import MyAssignments from "./pages/MyAssignments";
import Settings from "./pages/Settings";
import Attendance from "./pages/Attendance";
import GlobalAttendance from "./pages/GlobalAttendance";
import FeeManager from "./pages/FeeManager";
import ResultManager from "./pages/ResultManager";
import ResultHistory from "./pages/ResultHistory";
import AttendanceHistory from "./pages/AttendanceHistory";
import FeeHistory from "./pages/FeeHistory";
import MyResults from "./pages/MyResults";
import StudentAttendanceHistory from "./pages/StudentAttendanceHistory";
import StudentFeeHistory from "./pages/StudentFeeHistory";

function Layout({ children, user }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/';

  return (
    <>
      <Header />
      <div style={{ display: 'flex', minHeight: '80vh' }}>
        {!isAuthPage && user && <Sidebar role={user.role} />}
        <div style={{ flex: 1, background: '#f4f8ff' }}>
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      setUser(JSON.parse(loggedUser));
    }
  }, []);

  const ProtectedRoute = ({ children, allowedRole }) => {
    if (!user) return <Navigate to="/" />;
    if (allowedRole && user.role !== allowedRole) return <Navigate to="/" />;
    return children;
  };

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={user ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} /> : <Login setUser={setUser} />} />
          
          {/* TEACHER ROUTES */}
          <Route path="/teacher" element={<ProtectedRoute allowedRole="teacher"><TeacherDashboard user={user} /></ProtectedRoute>} />
          <Route path="/teacher/classes" element={<ProtectedRoute allowedRole="teacher"><ClassManager /></ProtectedRoute>} />
          <Route path="/teacher/students" element={<ProtectedRoute allowedRole="teacher"><StudentManager /></ProtectedRoute>} />
          <Route path="/teacher/attendance" element={<ProtectedRoute allowedRole="teacher"><Attendance /></ProtectedRoute>} />
          <Route path="/teacher/attendance-global" element={<ProtectedRoute allowedRole="teacher"><GlobalAttendance /></ProtectedRoute>} />
          <Route path="/teacher/attendance-history" element={<ProtectedRoute allowedRole="teacher"><AttendanceHistory /></ProtectedRoute>} />
          <Route path="/teacher/fees" element={<ProtectedRoute allowedRole="teacher"><FeeManager /></ProtectedRoute>} />
          <Route path="/teacher/fees-history" element={<ProtectedRoute allowedRole="teacher"><FeeHistory /></ProtectedRoute>} />
          <Route path="/teacher/results" element={<ProtectedRoute allowedRole="teacher"><ResultManager /></ProtectedRoute>} />
          <Route path="/teacher/result-history" element={<ProtectedRoute allowedRole="teacher"><ResultHistory /></ProtectedRoute>} />
          
          {/* STUDENT ROUTES */}
          <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentDashboard user={user} /></ProtectedRoute>} />
          <Route path="/student/classes" element={<ProtectedRoute allowedRole="student"><MyClasses /></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute allowedRole="student"><MyAssignments /></ProtectedRoute>} />
          <Route path="/student/results" element={<ProtectedRoute allowedRole="student"><MyResults /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute allowedRole="student"><StudentAttendanceHistory /></ProtectedRoute>} />
          <Route path="/student/fees" element={<ProtectedRoute allowedRole="student"><StudentFeeHistory /></ProtectedRoute>} />
          
          {/* SHARED ROUTES */}
          <Route path="/class/:id" element={<ProtectedRoute><CourseView user={user} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings user={user} /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
