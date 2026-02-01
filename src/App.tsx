import { useState } from 'react';
import { Game } from './components/Game';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerCount, setPlayerCount] = useState(2);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  if (gameStarted) {
    const playerNames = Array.from({ length: playerCount }, (_, i) => `Player ${i + 1}`);
    return <Game playerNames={playerNames} />;
  }

  return (
    <div className="start-screen">
      <div className="title-container">
        <h1 className="game-title">ROBO RALLY</h1>
        <p className="game-subtitle">Program your robot. Survive the factory. Reach the checkpoints!</p>
      </div>

      <div className="start-menu">
        <div className="player-select">
          <label>Number of Players:</label>
          <div className="player-buttons">
            {[2, 3, 4].map(num => (
              <button
                key={num}
                className={`player-count-btn ${playerCount === num ? 'selected' : ''}`}
                onClick={() => setPlayerCount(num)}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <button className="start-btn" onClick={handleStartGame}>
          Start Game
        </button>

        <div className="game-info">
          <h3>About Robo Rally</h3>
          <p>
            Race your robot through a dangerous factory floor. Program your moves
            in advance, then watch chaos unfold as all robots execute their
            programs simultaneously!
          </p>
          <h4>Board Elements:</h4>
          <ul>
            <li><strong>Conveyors:</strong> Move robots in the direction shown</li>
            <li><strong>Express Conveyors:</strong> Move robots twice per turn</li>
            <li><strong>Gears:</strong> Rotate robots 90 degrees</li>
            <li><strong>Pits:</strong> Destroy robots that fall in</li>
            <li><strong>Lasers:</strong> Damage robots in their path</li>
            <li><strong>Checkpoints:</strong> Touch them in order to win!</li>
            <li><strong>Repair Sites:</strong> Heal 1 damage at end of round</li>
          </ul>
        </div>
      </div>

      <div className="credits">
        <p>A browser-based clone of the classic board game</p>
      </div>
    </div>
  );
}

export default App;
