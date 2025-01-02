import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="auth-buttons">
        <button 
          className="auth-button login-button"
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <button 
          className="auth-button signup-button"
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </div>
      <div className="home-content">
        <h1 className="home-title">Memory Game</h1>
        <button 
          className="play-button"
          onClick={() => navigate('/game')}
        >
          Play Game
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default Home; 