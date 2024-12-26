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
        <p>Match the cards to win!</p>
      </footer>
    </div>
  );
}

export default App;
