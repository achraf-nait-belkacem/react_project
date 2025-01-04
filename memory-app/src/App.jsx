import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './components/Home';
import GameBoard from './GameBoard';
import Footer from './components/Footer';
import Signup from "./components/signup.jsx";
import Login from './components/login';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const GameHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        Memory Game
      </h1>
      <div className="auth-buttons">
        {user ? (
          <>
            <span className="user-info">Welcome, {user.name}</span>
            <button 
              className="auth-button login-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </header>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/game" element={
              <ProtectedRoute>
                <>
                  <GameHeader />
                  <main className="app-main">
                    <GameBoard />
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
