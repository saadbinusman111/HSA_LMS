import React from 'react';
import logo from '../assets/logo.png';

export default function Header() {
  return (
    <div className="header">
      <img src={logo} alt="HSA_LMS Logo" style={{ height: '80px', marginBottom: '20px' }} />
      <h1>HSA_LMS</h1>
      <p>Smart Tuition Learning Management System</p>
    </div>
  );
}
