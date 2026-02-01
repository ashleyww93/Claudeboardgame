import type { BoardCell as BoardCellType } from '../game/types';
import './BoardCell.css';

interface BoardCellProps {
  cell: BoardCellType;
  size: number;
}

export const BoardCell = ({ cell, size }: BoardCellProps) => {
  const getCellClass = (): string => {
    const classes = ['board-cell'];

    switch (cell.type) {
      case 'pit':
        classes.push('cell-pit');
        break;
      case 'conveyorNorth':
      case 'conveyorEast':
      case 'conveyorSouth':
      case 'conveyorWest':
        classes.push('cell-conveyor');
        break;
      case 'expressConveyorNorth':
      case 'expressConveyorEast':
      case 'expressConveyorSouth':
      case 'expressConveyorWest':
        classes.push('cell-express-conveyor');
        break;
      case 'gearClockwise':
      case 'gearCounterClockwise':
        classes.push('cell-gear');
        break;
      case 'repairSite':
        classes.push('cell-repair');
        break;
      case 'checkpoint':
        classes.push('cell-checkpoint');
        break;
      default:
        classes.push('cell-floor');
    }

    return classes.join(' ');
  };

  const getConveyorDirection = (): number | null => {
    switch (cell.type) {
      case 'conveyorNorth':
      case 'expressConveyorNorth':
        return 0;
      case 'conveyorEast':
      case 'expressConveyorEast':
        return 90;
      case 'conveyorSouth':
      case 'expressConveyorSouth':
        return 180;
      case 'conveyorWest':
      case 'expressConveyorWest':
        return 270;
      default:
        return null;
    }
  };

  const conveyorDir = getConveyorDirection();
  const isConveyor = conveyorDir !== null;
  const isExpress = cell.type.includes('express');

  return (
    <div
      className={getCellClass()}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Conveyor arrow */}
      {isConveyor && (
        <div
          className={`conveyor-arrow ${isExpress ? 'express' : ''}`}
          style={{ transform: `rotate(${conveyorDir}deg)` }}
        >
          {isExpress ? '▲▲' : '▲'}
        </div>
      )}

      {/* Gear indicator */}
      {cell.type === 'gearClockwise' && <div className="gear-indicator cw">↻</div>}
      {cell.type === 'gearCounterClockwise' && <div className="gear-indicator ccw">↺</div>}

      {/* Checkpoint number */}
      {cell.type === 'checkpoint' && cell.checkpointNumber && (
        <div className="checkpoint-number">{cell.checkpointNumber}</div>
      )}

      {/* Repair site */}
      {cell.type === 'repairSite' && <div className="repair-indicator">🔧</div>}

      {/* Starting position */}
      {cell.startPosition && (
        <div className="start-position">{cell.startPosition}</div>
      )}

      {/* Walls */}
      {cell.walls.north && <div className="wall wall-north" />}
      {cell.walls.east && <div className="wall wall-east" />}
      {cell.walls.south && <div className="wall wall-south" />}
      {cell.walls.west && <div className="wall wall-west" />}

      {/* Laser emitter */}
      {cell.laser && (
        <div className={`laser-emitter laser-${cell.laser.direction}`}>
          {'|'.repeat(cell.laser.strength)}
        </div>
      )}
    </div>
  );
};
