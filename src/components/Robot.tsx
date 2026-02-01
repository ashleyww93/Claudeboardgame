import type { Robot as RobotType } from '../game/types';
import { directionToAngle } from '../game/types';
import './Robot.css';

interface RobotProps {
  robot: RobotType;
  color: string;
  cellSize: number;
  isAnimating?: boolean;
}

export const Robot = ({ robot, color, cellSize, isAnimating }: RobotProps) => {
  if (robot.lives <= 0) return null;

  const angle = directionToAngle[robot.direction];
  const size = cellSize * 0.7;

  return (
    <div
      className={`robot ${isAnimating ? 'animating' : ''}`}
      style={{
        left: robot.position.x * cellSize + cellSize / 2,
        top: robot.position.y * cellSize + cellSize / 2,
        width: size,
        height: size,
        backgroundColor: color,
        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        boxShadow: `0 0 10px ${color}`,
      }}
    >
      <div className="robot-direction-indicator" />
      <div className="robot-damage-display">
        {robot.damage > 0 && <span className="damage-count">{robot.damage}</span>}
      </div>
    </div>
  );
};
