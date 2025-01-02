import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import GameBoard from './GameBoard';
import Footer from './components/Footer';
import './App.css';
import Signup from "./components/signup.jsx";

// Create a separate header component to use navigation
const GameHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        Memory Game
      </h1>
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
    </header>
  );
};

const App = () => {
  return (
    <Router>
      <nav>
        <Link to="/signup">
          <button>Signup</button>
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/game"
          element={
            <>
              <GameHeader />
              <main className="app-main">
                <GameBoard />
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </Router>
  );
};


export default App;
