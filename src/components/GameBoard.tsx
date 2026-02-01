import type { Board, Robot as RobotType, Player } from '../game/types';
import type { ReactElement } from 'react';
import { BoardCell } from './BoardCell';
import { Robot } from './Robot';
import './GameBoard.css';

interface GameBoardProps {
  board: Board;
  robots: RobotType[];
  players: Player[];
  cellSize?: number;
}

export const GameBoard = ({ board, robots, players, cellSize = 50 }: GameBoardProps) => {
  const getPlayerColor = (playerId: string): string => {
    const player = players.find(p => p.id === playerId);
    return player?.color || '#888';
  };

  return (
    <div
      className="game-board"
      style={{
        width: board.width * cellSize,
        height: board.height * cellSize,
      }}
    >
      {/* Render cells */}
      {board.cells.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            style={{
              position: 'absolute',
              left: x * cellSize,
              top: y * cellSize,
            }}
          >
            <BoardCell cell={cell} size={cellSize} />
          </div>
        ))
      )}

      {/* Render robots */}
      {robots.map(robot => (
        <Robot
          key={robot.id}
          robot={robot}
          color={getPlayerColor(robot.playerId)}
          cellSize={cellSize}
        />
      ))}

      {/* Render laser beams */}
      <LaserBeams board={board} robots={robots} cellSize={cellSize} />
    </div>
  );
};

// Component to render laser beams
const LaserBeams = ({
  board,
  robots,
  cellSize,
}: {
  board: Board;
  robots: RobotType[];
  cellSize: number;
}) => {
  const beams: ReactElement[] = [];

  // Helper to check wall blocking
  const isBlockedByWall = (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    direction: 'north' | 'south' | 'east' | 'west'
  ): boolean => {
    const fromCell = board.cells[fromY]?.[fromX];
    const toCell = board.cells[toY]?.[toX];

    if (fromCell?.walls[direction]) return true;

    const opposite: Record<string, 'north' | 'south' | 'east' | 'west'> = {
      north: 'south',
      south: 'north',
      east: 'west',
      west: 'east',
    };
    if (toCell?.walls[opposite[direction]]) return true;

    return false;
  };

  // Helper to check robot at position
  const getRobotAt = (x: number, y: number): RobotType | undefined => {
    return robots.find(r => r.position.x === x && r.position.y === y && r.lives > 0);
  };

  // Render board lasers
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      const cell = board.cells[y][x];
      if (!cell.laser) continue;

      const dir = cell.laser.direction;
      const deltas: Record<string, { dx: number; dy: number }> = {
        north: { dx: 0, dy: -1 },
        south: { dx: 0, dy: 1 },
        east: { dx: 1, dy: 0 },
        west: { dx: -1, dy: 0 },
      };

      const delta = deltas[dir];
      let cx = x;
      let cy = y;
      const beamSegments: { x: number; y: number }[] = [];

      while (true) {
        const nx = cx + delta.dx;
        const ny = cy + delta.dy;

        if (isBlockedByWall(cx, cy, nx, ny, dir)) break;
        if (nx < 0 || nx >= board.width || ny < 0 || ny >= board.height) break;

        beamSegments.push({ x: nx, y: ny });

        if (getRobotAt(nx, ny)) break;

        cx = nx;
        cy = ny;
      }

      // Render beam segments
      beamSegments.forEach((seg, i) => {
        const isHorizontal = dir === 'east' || dir === 'west';
        beams.push(
          <div
            key={`board-laser-${x}-${y}-${i}`}
            className={`laser-beam ${cell.laser!.strength > 1 ? 'double' : ''}`}
            style={{
              left: seg.x * cellSize + cellSize / 2,
              top: seg.y * cellSize + cellSize / 2,
              width: isHorizontal ? cellSize : 2,
              height: isHorizontal ? 2 : cellSize,
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      });
    }
  }

  // Render robot lasers
  robots.forEach(robot => {
    if (robot.lives <= 0) return;

    const dir = robot.direction;
    const deltas: Record<string, { dx: number; dy: number }> = {
      north: { dx: 0, dy: -1 },
      south: { dx: 0, dy: 1 },
      east: { dx: 1, dy: 0 },
      west: { dx: -1, dy: 0 },
    };

    const delta = deltas[dir];
    let cx = robot.position.x;
    let cy = robot.position.y;
    const beamSegments: { x: number; y: number }[] = [];

    while (true) {
      const nx = cx + delta.dx;
      const ny = cy + delta.dy;

      if (isBlockedByWall(cx, cy, nx, ny, dir)) break;
      if (nx < 0 || nx >= board.width || ny < 0 || ny >= board.height) break;

      const hitRobot = getRobotAt(nx, ny);
      if (hitRobot && hitRobot.id !== robot.id) {
        beamSegments.push({ x: nx, y: ny });
        break;
      }

      beamSegments.push({ x: nx, y: ny });
      cx = nx;
      cy = ny;
    }

    const isHorizontal = dir === 'east' || dir === 'west';
    beamSegments.forEach((seg, i) => {
      beams.push(
        <div
          key={`robot-laser-${robot.id}-${i}`}
          className="laser-beam robot-laser"
          style={{
            left: seg.x * cellSize + cellSize / 2,
            top: seg.y * cellSize + cellSize / 2,
            width: isHorizontal ? cellSize : 1,
            height: isHorizontal ? 1 : cellSize,
            transform: 'translate(-50%, -50%)',
          }}
        />
      );
    });
  });

  return <>{beams}</>;
};
