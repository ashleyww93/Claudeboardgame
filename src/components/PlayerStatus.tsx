import type { Player, Robot } from '../game/types';
import './PlayerStatus.css';

interface PlayerStatusProps {
  player: Player;
  robot: Robot | undefined;
  isCurrentPlayer: boolean;
  totalCheckpoints: number;
}

export const PlayerStatus = ({ player, robot, isCurrentPlayer, totalCheckpoints }: PlayerStatusProps) => {
  if (!robot) return null;

  return (
    <div
      className={`player-status ${isCurrentPlayer ? 'current' : ''}`}
      style={{ borderColor: player.color }}
    >
      <div className="player-header">
        <div
          className="player-color-indicator"
          style={{ backgroundColor: player.color }}
        />
        <span className="player-name">{player.name}</span>
      </div>

      <div className="player-stats">
        <div className="stat">
          <span className="stat-label">Lives:</span>
          <span className="stat-value">{'❤️'.repeat(robot.lives)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Damage:</span>
          <span className="stat-value damage">{robot.damage}/10</span>
        </div>
        <div className="stat">
          <span className="stat-label">Checkpoints:</span>
          <span className="stat-value checkpoint">
            {robot.checkpointsReached}/{totalCheckpoints}
          </span>
        </div>
      </div>

      {robot.lives <= 0 && (
        <div className="player-eliminated">ELIMINATED</div>
      )}
    </div>
  );
};
