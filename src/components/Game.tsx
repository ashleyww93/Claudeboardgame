import { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState } from '../game/types';
import {
  initializeGame,
  dealCards,
  placeCard,
  removeCardFromRegister,
  isPlayerReady,
  allPlayersReady,
  executeRegister,
  cleanup,
} from '../game/gameLogic';
import { GameBoard } from './GameBoard';
import { RegisterPanel } from './RegisterPanel';
import { HandPanel } from './HandPanel';
import { PlayerStatus } from './PlayerStatus';
import './Game.css';

interface GameProps {
  playerNames: string[];
}

export const Game = ({ playerNames }: GameProps) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const state = initializeGame(playerNames);
    return dealCards(state);
  });

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [executionSpeed, setExecutionSpeed] = useState(1000);
  const [showInstructions, setShowInstructions] = useState(true);
  const executionTimerRef = useRef<number | null>(null);

  const currentPlayer = gameState.players[currentPlayerIndex];

  // Handle card selection
  const handleSelectCard = useCallback((cardId: string) => {
    if (gameState.phase !== 'programming') return;
    setSelectedCardId(prev => prev === cardId ? null : cardId);
  }, [gameState.phase]);

  // Handle placing card in register
  const handlePlaceCard = useCallback((registerIndex: number) => {
    if (!selectedCardId || gameState.phase !== 'programming') return;

    const newState = placeCard(gameState, currentPlayer.id, selectedCardId, registerIndex);
    setGameState(newState);
    setSelectedCardId(null);
  }, [gameState, currentPlayer, selectedCardId]);

  // Handle removing card from register
  const handleRemoveCard = useCallback((registerIndex: number) => {
    if (gameState.phase !== 'programming') return;

    const newState = removeCardFromRegister(gameState, currentPlayer.id, registerIndex);
    setGameState(newState);
  }, [gameState, currentPlayer]);

  // Handle ending turn (for multiplayer simulation)
  const handleEndTurn = useCallback(() => {
    if (!isPlayerReady(currentPlayer)) {
      alert('Please fill all registers before ending your turn!');
      return;
    }

    const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;

    // If we've gone through all players and everyone is ready, start execution
    if (nextPlayerIndex === 0 && allPlayersReady(gameState)) {
      setGameState(prev => ({ ...prev, phase: 'execution', currentRegister: 0 }));
    } else {
      setCurrentPlayerIndex(nextPlayerIndex);
    }
  }, [currentPlayer, currentPlayerIndex, gameState]);

  // Execute registers automatically when in execution phase
  useEffect(() => {
    if (gameState.phase !== 'execution') {
      // Clear any pending timer when not in execution phase
      if (executionTimerRef.current) {
        clearTimeout(executionTimerRef.current);
        executionTimerRef.current = null;
      }
      return;
    }

    // Schedule next register execution
    executionTimerRef.current = window.setTimeout(() => {
      const result = executeRegister(gameState);
      setGameState(result.newState);
    }, executionSpeed);

    return () => {
      if (executionTimerRef.current) {
        clearTimeout(executionTimerRef.current);
        executionTimerRef.current = null;
      }
    };
  }, [gameState, executionSpeed]);

  // Handle cleanup phase - deal new cards and return to programming
  useEffect(() => {
    if (gameState.phase !== 'cleanup') return;

    // Small delay to show "Cleanup Phase" message
    const timer = setTimeout(() => {
      const newState = cleanup(gameState);
      setGameState(newState);
      setCurrentPlayerIndex(0);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState]);

  // Handle new game
  const handleNewGame = useCallback(() => {
    if (executionTimerRef.current) {
      clearTimeout(executionTimerRef.current);
      executionTimerRef.current = null;
    }
    const newState = initializeGame(playerNames);
    setGameState(dealCards(newState));
    setCurrentPlayerIndex(0);
    setSelectedCardId(null);
  }, [playerNames]);

  return (
    <div className="game-container">
      {/* Header */}
      <div className="game-header">
        <h1>Robo Rally</h1>
        <div className="phase-indicator">
          Phase: <span className="phase-name">{gameState.phase.toUpperCase()}</span>
          {gameState.phase === 'execution' && (
            <span className="register-indicator">
              {' '}(Register {gameState.currentRegister + 1}/5)
            </span>
          )}
        </div>
      </div>

      {/* Instructions */}
      {showInstructions && (
        <div className="instructions">
          <button className="close-btn" onClick={() => setShowInstructions(false)}>×</button>
          <h3>How to Play</h3>
          <ul>
            <li>Click a card in your hand to select it, then click a register slot to place it</li>
            <li>Fill all 5 registers with cards, then click "End Turn"</li>
            <li>Cards execute in priority order (higher = first)</li>
            <li>Reach all checkpoints in order to win!</li>
            <li>Avoid pits, lasers, and running off the board</li>
          </ul>
        </div>
      )}

      {/* Winner announcement */}
      {gameState.winner && (
        <div className="winner-overlay">
          <div className="winner-message">
            <h2>
              {gameState.players.find(p => p.id === gameState.winner)?.name} Wins!
            </h2>
            <button onClick={handleNewGame}>Play Again</button>
          </div>
        </div>
      )}

      <div className="game-layout">
        {/* Left panel - Player status */}
        <div className="left-panel">
          <h2>Players</h2>
          {gameState.players.map((player, index) => (
            <PlayerStatus
              key={player.id}
              player={player}
              robot={gameState.robots.find(r => r.playerId === player.id)}
              isCurrentPlayer={index === currentPlayerIndex && gameState.phase === 'programming'}
              totalCheckpoints={gameState.totalCheckpoints}
            />
          ))}

          {/* Execution speed control */}
          <div className="speed-control">
            <label>Execution Speed:</label>
            <input
              type="range"
              min="200"
              max="2000"
              step="100"
              value={executionSpeed}
              onChange={e => setExecutionSpeed(Number(e.target.value))}
            />
            <span>{executionSpeed}ms</span>
          </div>

          <button className="new-game-btn" onClick={handleNewGame}>
            New Game
          </button>
        </div>

        {/* Center - Game board */}
        <div className="center-panel">
          <GameBoard
            board={gameState.board}
            robots={gameState.robots}
            players={gameState.players}
            cellSize={50}
          />
        </div>

        {/* Right panel - Card management */}
        <div className="right-panel">
          {gameState.phase === 'programming' && currentPlayer && (
            <>
              <div className="current-player-indicator" style={{ borderColor: currentPlayer.color }}>
                <div className="player-color" style={{ backgroundColor: currentPlayer.color }} />
                <span>{currentPlayer.name}'s Turn</span>
              </div>

              <RegisterPanel
                player={currentPlayer}
                onRemoveCard={handleRemoveCard}
                disabled={gameState.phase !== 'programming'}
              />

              <div className="register-buttons">
                {[0, 1, 2, 3, 4].map(i => (
                  <button
                    key={i}
                    className={`register-place-btn ${currentPlayer.registers[i] ? 'filled' : ''} ${currentPlayer.lockedRegisters[i] ? 'locked' : ''}`}
                    onClick={() => handlePlaceCard(i)}
                    disabled={!selectedCardId || currentPlayer.lockedRegisters[i]}
                  >
                    {currentPlayer.lockedRegisters[i] ? '🔒' : i + 1}
                  </button>
                ))}
              </div>

              <HandPanel
                cards={currentPlayer.hand}
                selectedCardId={selectedCardId}
                onSelectCard={handleSelectCard}
                disabled={gameState.phase !== 'programming'}
              />

              <button
                className="end-turn-btn"
                onClick={handleEndTurn}
                disabled={!isPlayerReady(currentPlayer)}
              >
                {isPlayerReady(currentPlayer)
                  ? currentPlayerIndex === gameState.players.length - 1
                    ? 'Execute!'
                    : 'End Turn'
                  : 'Fill All Registers'}
              </button>
            </>
          )}

          {gameState.phase === 'execution' && (
            <div className="execution-panel">
              <h2>Executing Programs...</h2>
              <div className="execution-register">
                Register {gameState.currentRegister + 1} of 5
              </div>
              <div className="execution-cards">
                {gameState.players.map(player => {
                  const card = player.registers[gameState.currentRegister];
                  const robot = gameState.robots.find(r => r.playerId === player.id);
                  if (!card || !robot || robot.lives <= 0) return null;

                  return (
                    <div key={player.id} className="execution-card-info">
                      <span style={{ color: player.color }}>{player.name}:</span>
                      <span>{card.type} (P:{card.priority})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {gameState.phase === 'cleanup' && (
            <div className="cleanup-panel">
              <h2>Cleanup Phase</h2>
              <p>Repairing robots, dealing new cards...</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="legend">
        <h3>Board Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#000' }} />
            <span>Pit</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#4a4a2a' }}>▲</div>
            <span>Conveyor</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#2a4a4a' }}>▲▲</div>
            <span>Express Conveyor</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#4a3a2a' }}>↻</div>
            <span>Gear</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#4a2a4a' }}>1</div>
            <span>Checkpoint</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#2a4a2a' }}>🔧</div>
            <span>Repair</span>
          </div>
          <div className="legend-item">
            <div className="legend-color wall-sample" />
            <span>Wall</span>
          </div>
        </div>
      </div>
    </div>
  );
};
