// Core game types for Robo Rally clone

export type Direction = 'north' | 'east' | 'south' | 'west';

export type CardType =
  | 'move1'
  | 'move2'
  | 'move3'
  | 'backup'
  | 'turnLeft'
  | 'turnRight'
  | 'uTurn';

export interface Card {
  id: string;
  type: CardType;
  priority: number; // Higher priority moves first
}

export interface Position {
  x: number;
  y: number;
}

export interface Robot {
  id: string;
  playerId: string;
  position: Position;
  direction: Direction;
  damage: number; // 0-9, at 10 robot is destroyed
  lives: number;
  checkpointsReached: number; // Which checkpoint they need to reach next
  lastCheckpoint: Position | null; // Respawn position
  isPoweredDown: boolean;
}

export type BoardElementType =
  | 'floor'
  | 'pit'
  | 'conveyorNorth'
  | 'conveyorEast'
  | 'conveyorSouth'
  | 'conveyorWest'
  | 'expressConveyorNorth'
  | 'expressConveyorEast'
  | 'expressConveyorSouth'
  | 'expressConveyorWest'
  | 'gearClockwise'
  | 'gearCounterClockwise'
  | 'repairSite'
  | 'checkpoint';

export interface Wall {
  north: boolean;
  east: boolean;
  south: boolean;
  west: boolean;
}

export interface Laser {
  direction: Direction;
  strength: number; // 1, 2, or 3 beams
}

export interface BoardCell {
  type: BoardElementType;
  walls: Wall;
  laser: Laser | null;
  checkpointNumber?: number; // For checkpoint cells
  startPosition?: number; // For starting positions (1-8)
}

export interface Board {
  width: number;
  height: number;
  cells: BoardCell[][];
}

export interface Player {
  id: string;
  name: string;
  color: string;
  hand: Card[];
  registers: (Card | null)[]; // 5 registers
  lockedRegisters: boolean[]; // Which registers are locked due to damage
}

export type GamePhase =
  | 'setup'
  | 'programming' // Players select cards
  | 'execution' // Robots execute their programs
  | 'cleanup' // End of round cleanup
  | 'gameOver';

export interface GameState {
  phase: GamePhase;
  board: Board;
  players: Player[];
  robots: Robot[];
  currentRegister: number; // 0-4, which register is being executed
  currentPlayerIndex: number; // Whose turn during execution
  deck: Card[];
  discardPile: Card[];
  winner: string | null;
  totalCheckpoints: number;
}

// Animation types
export interface AnimationStep {
  type: 'move' | 'rotate' | 'damage' | 'destroy' | 'respawn' | 'checkpoint';
  robotId: string;
  from?: Position;
  to?: Position;
  fromDirection?: Direction;
  toDirection?: Direction;
  damageAmount?: number;
}

export interface ExecutionResult {
  newState: GameState;
  animations: AnimationStep[];
}

// Utility functions for directions
export const directionToAngle: Record<Direction, number> = {
  north: 0,
  east: 90,
  south: 180,
  west: 270,
};

export const turnRight = (dir: Direction): Direction => {
  const order: Direction[] = ['north', 'east', 'south', 'west'];
  const idx = order.indexOf(dir);
  return order[(idx + 1) % 4];
};

export const turnLeft = (dir: Direction): Direction => {
  const order: Direction[] = ['north', 'east', 'south', 'west'];
  const idx = order.indexOf(dir);
  return order[(idx + 3) % 4];
};

export const turnAround = (dir: Direction): Direction => {
  const order: Direction[] = ['north', 'east', 'south', 'west'];
  const idx = order.indexOf(dir);
  return order[(idx + 2) % 4];
};

export const getDirectionDelta = (dir: Direction): Position => {
  switch (dir) {
    case 'north': return { x: 0, y: -1 };
    case 'south': return { x: 0, y: 1 };
    case 'east': return { x: 1, y: 0 };
    case 'west': return { x: -1, y: 0 };
  }
};

export const oppositeDirection = (dir: Direction): Direction => {
  switch (dir) {
    case 'north': return 'south';
    case 'south': return 'north';
    case 'east': return 'west';
    case 'west': return 'east';
  }
};
