import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Helper component moved OUTSIDE to prevent losing focus on every render
const PasswordInput = ({ label, value, onChange, show, setShow, placeholder }) => (
  <div style={{ marginBottom: '15px' }}>
    <label style={{ fontSize: '13px', color: '#222', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <input 
        type={show ? "text" : "password"} 
        placeholder={placeholder || "••••••"}
        style={{ background: '#eceef1', border: '2px solid #cbd5e0', color: '#1a202c', fontWeight: '600', paddingRight: '45px', width: '100%', padding: '12px', borderRadius: '8px' }} 
        value={value} 
        onChange={onChange} 
        required 
      />
      <button 
        type="button" 
        onClick={() => setShow(!show)}
        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '16px', width: 'auto', padding: '5px' }}
      >
        {show ? '👁️' : '👁️‍🗨️'}
      </button>
    </div>
  </div>
);

export default function Settings({ user }) {
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [usernameData, setUsernameData] = useState({ newUsername: '', currentPassword: '' });
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);
  const [showP3, setShowP3] = useState(false);
  const [showP4, setShowP4] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const clearMessages = () => {
    setTimeout(() => {
      setMessage('');
      setError('');
    }, 4000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (user.role === 'teacher' && !/^\d{6}$/.test(passwords.newPassword)) {
       setError('For security, your new PIN must be exactly 6 digits.');
       return;
    }

    setLoading(true);
    try {
      await axios.post('/api/change-password', {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Security credentials updated successfully!');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      clearMessages();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update security credentials');
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    setLoading(true);
    try {
      const res = await axios.post('/api/change-username', {
        newUsername: usernameData.newUsername,
        password: usernameData.currentPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Username updated successfully!');
      setUsernameData({ newUsername: '', currentPassword: '' });
      clearMessages();
      
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser) {
        localUser.username = res.data.username;
        localStorage.setItem('user', JSON.stringify(localUser));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update username');
      clearMessages();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
      <div style={{ alignSelf: 'flex-start', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="title" style={{ margin: 0 }}>Account Settings</div>
        <button onClick={() => navigate(-1)} style={{ background: '#555', padding: '8px 20px', fontSize: '14px' }}>&larr; Go Back</button>
      </div>

      {message && (
        <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '8px', fontSize: '14px', width: '100%', maxWidth: '450px', textAlign: 'center', border: '1px solid #c8e6c9', fontWeight: 'bold' }}>
          ✔ {message}
        </div>
      )}

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '8px', fontSize: '14px', width: '100%', maxWidth: '450px', textAlign: 'center', border: '1px solid #ffcdd2', fontWeight: 'bold' }}>
          ⚠️ {error}
        </div>
      )}
      
      {/* PASSWORD CHANGE CARD (TEACHER ONLY) */}
      {user.role === 'teacher' && (
        <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '40px', borderTop: '5px solid #1565C0' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ width: '50px', height: '50px', background: '#f0f7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#1565C0', fontSize: '20px' }}>🔒</div>
            <h2 style={{ color: '#333', fontSize: '20px', fontWeight: 'bold' }}>Change Security PIN</h2>
          </div>
          
          <form onSubmit={handlePasswordChange}>
            <PasswordInput label="CURRENT 6-DIGIT PIN" value={passwords.oldPassword} onChange={e => setPasswords({...passwords, oldPassword: e.target.value})} show={showP1} setShow={setShowP1} />
            <PasswordInput label="NEW 6-DIGIT PIN" value={passwords.newPassword} onChange={e => setPasswords({...passwords, newPassword: e.target.value})} show={showP2} setShow={setShowP2} placeholder="Enter 6 digits" />
            <PasswordInput label="CONFIRM NEW PIN" value={passwords.confirmPassword} onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} show={showP3} setShow={setShowP3} />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}>{loading ? 'Updating...' : 'Update PIN'}</button>
          </form>
        </div>
      )}

      {/* USERNAME CHANGE CARD (TEACHER ONLY) */}
      {user.role === 'teacher' && (
        <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '40px', borderTop: '5px solid #1565C0' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ width: '70px', height: '70px', background: 'linear-gradient(135deg, #1565C0, #42A5F5)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'white', boxShadow: '0 10px 20px rgba(21, 101, 192, 0.2)', transform: 'rotate(-5deg)' }}>
              <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <h2 style={{ color: '#333', fontSize: '20px', fontWeight: 'bold' }}>Change Username</h2>
          </div>
          
          <form onSubmit={handleUsernameChange}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '13px', color: '#222', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>NEW USERNAME</label>
              <input type="text" placeholder="Enter new username" style={{ background: '#eceef1', border: '2px solid #cbd5e0', color: '#1a202c', fontWeight: '600', width: '100%', padding: '12px', borderRadius: '8px' }} value={usernameData.newUsername} onChange={e => setUsernameData({...usernameData, newUsername: e.target.value})} required />
            </div>
            <PasswordInput label="CONFIRM WITH PIN" value={usernameData.currentPassword} onChange={e => setUsernameData({...usernameData, currentPassword: e.target.value})} show={showP4} setShow={setShowP4} />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}>{loading ? 'Updating...' : 'Update Username'}</button>
          </form>
        </div>
      )}

      {/* STUDENT PROFILE VIEW (What student sees in settings) */}
      {user.role === 'student' && (
        <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '40px', borderTop: '5px solid #1565C0', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', background: '#f0f7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#1565C0', fontSize: '24px' }}>🎓</div>
          <h2 style={{ color: '#333', fontSize: '22px', fontWeight: 'bold' }}>My Profile</h2>
          <div style={{ marginTop: '20px', textAlign: 'left', background: '#f8fbff', padding: '20px', borderRadius: '12px' }}>
            <p style={{ marginBottom: '10px' }}><strong>Full Name:</strong> {user.fullName}</p>
            <p style={{ marginBottom: '10px' }}><strong>Username:</strong> {user.username}</p>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              Note: Contact your teacher to change your password or username.
            </p>
          </div>
        </div>
      )}

      {/* LOGOUT CARD */}
      <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '30px', borderTop: '5px solid #d32f2f', textAlign: 'center' }}>
        <h3 style={{ color: '#333', marginBottom: '15px', fontWeight: 'bold' }}>Session Management</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Sign out of your account to secure your data.</p>
        <button onClick={handleLogout} style={{ background: '#ffe5e5', color: '#d32f2f', border: '1px solid #d32f2f', padding: '12px 30px', width: '100%', fontWeight: 'bold' }}>Logout from HSA_LMS</button>
      </div>
    </div>
  );
}
