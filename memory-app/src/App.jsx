import React from 'react';
import GameBoard from './GameBoard.jsx';
import './App.css';

function App() {
  const handleTitleClick = () => {
    if (window.restartGame) {
      window.restartGame();
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={handleTitleClick}>Memory Game</h1>
      </header>
      <main className="app-main">
        <GameBoard />
      </main>
      <footer className="app-footer">
        <p>
          Powered by{' '}
          <a 
            href="https://github.com/achraf-nait-belkacem"
            target="_blank"
            rel="noopener noreferrer"
            className="author-name"
          >
            NAIT BELKACEM Achraf
          </a>
        </p>
        <p className="copyright">© 2024-2025</p>
      </footer>
    </div>
  );
}

export default App;
