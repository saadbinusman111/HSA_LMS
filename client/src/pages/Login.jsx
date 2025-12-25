import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      return setError('Please enter both Username and Password/PIN.');
    }

    try {
      const res = await axios.post('/api/auth/login', {
        username,
        password
      });
      
      const userData = res.data.user;
      const finalUser = { 
        ...userData, 
        fullName: displayName.trim() || userData.fullName 
      };
      
      setUser(finalUser);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(finalUser));

      if (userData.role === 'teacher') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Username or Password. Please try again.');
    }
  };

  return (
    <div className="login-box">
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={{ color: '#1565C0', fontSize: '28px', fontWeight: 'bold' }}>HSA_LMS Login</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>Smart Tuition Management System</p>
      </div>

      {error && (
        <div style={{ 
          background: '#ffebee', 
          color: '#c62828', 
          padding: '12px', 
          borderRadius: '8px', 
          fontSize: '14px', 
          marginBottom: '20px',
          textAlign: 'center',
          border: '1px solid #ffcdd2',
          fontWeight: 'bold'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '14px', color: '#222', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
          DISPLAY NAME (Optional)
        </label>
        <input 
          placeholder="Your name for dashboard" 
          style={{ background: '#eceef1', border: '2px solid #cbd5e0', color: '#1a202c', fontWeight: '600' }}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '14px', color: '#222', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
          USERNAME
        </label>
        <input 
          placeholder="Enter your username" 
          style={{ background: '#eceef1', border: '2px solid #cbd5e0', color: '#1a202c', fontWeight: '600' }}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <label style={{ fontSize: '14px', color: '#222', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
          PASSWORD / PIN
        </label>
        <div style={{ position: 'relative' }}>
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••" 
            style={{ background: '#eceef1', border: '2px solid #cbd5e0', color: '#1a202c', fontWeight: '600', paddingRight: '45px' }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            required
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ 
              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px', width: 'auto', padding: '5px'
            }}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>

      <button onClick={handleLogin} style={{ fontWeight: 'bold', height: '50px', fontSize: '16px' }}>
        Secure Login &rarr;
      </button>
    </div>
  );
}
