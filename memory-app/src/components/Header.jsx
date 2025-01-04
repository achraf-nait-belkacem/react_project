import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="auth-header">
      <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        Memory Game
      </h1>
    </header>
  );
};

export default Header; 