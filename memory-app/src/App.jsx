import React from 'react';
import GameBoard from './GameBoard';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Memory Game</h1>
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
