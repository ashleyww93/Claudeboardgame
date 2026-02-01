import type {
  GameState,
  Board,
  BoardCell,
  Card,
  CardType,
  Player,
  Robot,
  Position,
  Direction,
  AnimationStep,
  ExecutionResult,
} from './types';
import {
  getDirectionDelta,
  turnRight,
  turnLeft,
  turnAround,
  oppositeDirection,
} from './types';

// Generate a unique ID
const generateId = (): string => Math.random().toString(36).substr(2, 9);

// Create the deck of programming cards
export const createDeck = (): Card[] => {
  const cards: Card[] = [];

  // Move 1: 18 cards, priority 490-660
  for (let i = 0; i < 18; i++) {
    cards.push({ id: generateId(), type: 'move1', priority: 490 + i * 10 });
  }

  // Move 2: 12 cards, priority 670-780
  for (let i = 0; i < 12; i++) {
    cards.push({ id: generateId(), type: 'move2', priority: 670 + i * 10 });
  }

  // Move 3: 6 cards, priority 790-840
  for (let i = 0; i < 6; i++) {
    cards.push({ id: generateId(), type: 'move3', priority: 790 + i * 10 });
  }

  // Back Up: 6 cards, priority 430-480
  for (let i = 0; i < 6; i++) {
    cards.push({ id: generateId(), type: 'backup', priority: 430 + i * 10 });
  }

  // Turn Left: 18 cards, priority 70-240
  for (let i = 0; i < 18; i++) {
    cards.push({ id: generateId(), type: 'turnLeft', priority: 70 + i * 10 });
  }

  // Turn Right: 18 cards, priority 80-250
  for (let i = 0; i < 18; i++) {
    cards.push({ id: generateId(), type: 'turnRight', priority: 80 + i * 10 });
  }

  // U-Turn: 6 cards, priority 10-60
  for (let i = 0; i < 6; i++) {
    cards.push({ id: generateId(), type: 'uTurn', priority: 10 + i * 10 });
  }

  return cards;
};

// Shuffle an array
export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// Create a sample board
export const createBoard = (width: number = 12, height: number = 12): Board => {
  const cells: BoardCell[][] = [];

  for (let y = 0; y < height; y++) {
    const row: BoardCell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        type: 'floor',
        walls: { north: false, east: false, south: false, west: false },
        laser: null,
      });
    }
    cells.push(row);
  }

  // Add border walls
  for (let x = 0; x < width; x++) {
    cells[0][x].walls.north = true;
    cells[height - 1][x].walls.south = true;
  }
  for (let y = 0; y < height; y++) {
    cells[y][0].walls.west = true;
    cells[y][width - 1].walls.east = true;
  }

  return { width, height, cells };
};

// Create predefined interesting board
export const createClassicBoard = (): Board => {
  const board = createBoard(12, 12);

  // Add checkpoints
  board.cells[2][9].type = 'checkpoint';
  board.cells[2][9].checkpointNumber = 1;

  board.cells[5][5].type = 'checkpoint';
  board.cells[5][5].checkpointNumber = 2;

  board.cells[9][2].type = 'checkpoint';
  board.cells[9][2].checkpointNumber = 3;

  // Add some pits
  board.cells[3][3].type = 'pit';
  board.cells[3][8].type = 'pit';
  board.cells[8][3].type = 'pit';
  board.cells[8][8].type = 'pit';
  board.cells[5][6].type = 'pit';

  // Add conveyors (a conveyor path)
  board.cells[1][4].type = 'conveyorEast';
  board.cells[1][5].type = 'conveyorEast';
  board.cells[1][6].type = 'conveyorSouth';
  board.cells[2][6].type = 'conveyorSouth';
  board.cells[3][6].type = 'conveyorWest';
  board.cells[3][5].type = 'conveyorWest';
  board.cells[3][4].type = 'conveyorNorth';
  board.cells[2][4].type = 'conveyorNorth';

  // Add express conveyors
  board.cells[10][1].type = 'expressConveyorEast';
  board.cells[10][2].type = 'expressConveyorEast';
  board.cells[10][3].type = 'expressConveyorEast';
  board.cells[10][4].type = 'expressConveyorEast';
  board.cells[10][5].type = 'expressConveyorNorth';
  board.cells[9][5].type = 'expressConveyorNorth';
  board.cells[8][5].type = 'expressConveyorWest';
  board.cells[8][4].type = 'expressConveyorWest';

  // Add gears
  board.cells[6][2].type = 'gearClockwise';
  board.cells[6][9].type = 'gearCounterClockwise';
  board.cells[4][7].type = 'gearClockwise';

  // Add repair sites
  board.cells[0][0].type = 'repairSite';
  board.cells[11][11].type = 'repairSite';
  board.cells[6][6].type = 'repairSite';

  // Add walls
  board.cells[4][4].walls.east = true;
  board.cells[4][5].walls.west = true;
  board.cells[7][7].walls.south = true;
  board.cells[8][7].walls.north = true;
  board.cells[5][9].walls.north = true;
  board.cells[4][9].walls.south = true;
  board.cells[7][2].walls.east = true;
  board.cells[7][3].walls.west = true;

  // Add lasers (wall-mounted)
  board.cells[6][0].laser = { direction: 'east', strength: 1 };
  board.cells[6][0].walls.west = true;
  board.cells[0][6].laser = { direction: 'south', strength: 1 };
  board.cells[0][6].walls.north = true;
  board.cells[11][4].laser = { direction: 'north', strength: 2 };
  board.cells[11][4].walls.south = true;

  // Starting positions
  board.cells[11][1].startPosition = 1;
  board.cells[11][2].startPosition = 2;
  board.cells[11][3].startPosition = 3;
  board.cells[11][4].startPosition = 4;

  return board;
};

// Initialize game state
export const initializeGame = (playerNames: string[]): GameState => {
  const board = createClassicBoard();
  const deck = shuffle(createDeck());

  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

  const players: Player[] = playerNames.map((name, index) => ({
    id: generateId(),
    name,
    color: colors[index % colors.length],
    hand: [],
    registers: [null, null, null, null, null],
    lockedRegisters: [false, false, false, false, false],
  }));

  // Find starting positions on the board
  const startPositions: Position[] = [];
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      if (board.cells[y][x].startPosition) {
        startPositions[board.cells[y][x].startPosition! - 1] = { x, y };
      }
    }
  }

  // If no start positions defined, use bottom row
  if (startPositions.length === 0) {
    for (let i = 0; i < players.length; i++) {
      startPositions.push({ x: 1 + i * 2, y: board.height - 1 });
    }
  }

  const robots: Robot[] = players.map((player, index) => ({
    id: generateId(),
    playerId: player.id,
    position: startPositions[index] || { x: index * 2 + 1, y: board.height - 1 },
    direction: 'north' as Direction,
    damage: 0,
    lives: 3,
    checkpointsReached: 0,
    lastCheckpoint: startPositions[index] || { x: index * 2 + 1, y: board.height - 1 },
    isPoweredDown: false,
  }));

  // Count checkpoints
  let totalCheckpoints = 0;
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      if (board.cells[y][x].type === 'checkpoint') {
        totalCheckpoints = Math.max(totalCheckpoints, board.cells[y][x].checkpointNumber || 0);
      }
    }
  }

  return {
    phase: 'programming',
    board,
    players,
    robots,
    currentRegister: 0,
    currentPlayerIndex: 0,
    deck,
    discardPile: [],
    winner: null,
    totalCheckpoints,
  };
};

// Deal cards to players
export const dealCards = (state: GameState): GameState => {
  const newState = { ...state };
  newState.players = state.players.map(player => ({ ...player }));
  newState.deck = [...state.deck];
  newState.discardPile = [...state.discardPile];

  // Discard old hand cards that weren't locked
  for (const player of newState.players) {
    const robot = newState.robots.find(r => r.playerId === player.id);
    if (!robot) continue;

    // Discard non-locked register cards
    for (let i = 0; i < 5; i++) {
      if (!player.lockedRegisters[i] && player.registers[i]) {
        newState.discardPile.push(player.registers[i]!);
        player.registers[i] = null;
      }
    }

    // Discard remaining hand
    newState.discardPile.push(...player.hand);
    player.hand = [];
  }

  // Deal new cards
  for (const player of newState.players) {
    const robot = newState.robots.find(r => r.playerId === player.id);
    if (!robot || robot.lives <= 0) continue;

    // Cards dealt = 9 - damage
    const cardsToDeal = Math.max(0, 9 - robot.damage);

    // Check if we need to reshuffle
    if (newState.deck.length < cardsToDeal) {
      newState.deck = shuffle([...newState.deck, ...newState.discardPile]);
      newState.discardPile = [];
    }

    player.hand = newState.deck.splice(0, cardsToDeal);

    // Update locked registers based on damage
    player.lockedRegisters = [
      robot.damage >= 5,
      robot.damage >= 6,
      robot.damage >= 7,
      robot.damage >= 8,
      robot.damage >= 9,
    ];
  }

  return newState;
};

// Place a card in a register
export const placeCard = (
  state: GameState,
  playerId: string,
  cardId: string,
  registerIndex: number
): GameState => {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;

  // Check if register is locked
  if (player.lockedRegisters[registerIndex]) return state;

  const cardIndex = player.hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return state;

  const newState = { ...state };
  newState.players = state.players.map(p => {
    if (p.id !== playerId) return p;

    const newPlayer = { ...p };
    newPlayer.hand = [...p.hand];
    newPlayer.registers = [...p.registers];

    // If there's already a card in that register, put it back in hand
    if (newPlayer.registers[registerIndex]) {
      newPlayer.hand.push(newPlayer.registers[registerIndex]!);
    }

    // Move card from hand to register
    const [card] = newPlayer.hand.splice(cardIndex, 1);
    newPlayer.registers[registerIndex] = card;

    return newPlayer;
  });

  return newState;
};

// Remove a card from a register back to hand
export const removeCardFromRegister = (
  state: GameState,
  playerId: string,
  registerIndex: number
): GameState => {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;

  if (player.lockedRegisters[registerIndex]) return state;
  if (!player.registers[registerIndex]) return state;

  const newState = { ...state };
  newState.players = state.players.map(p => {
    if (p.id !== playerId) return p;

    const newPlayer = { ...p };
    newPlayer.hand = [...p.hand];
    newPlayer.registers = [...p.registers];

    newPlayer.hand.push(newPlayer.registers[registerIndex]!);
    newPlayer.registers[registerIndex] = null;

    return newPlayer;
  });

  return newState;
};

// Check if a player has programmed all registers
export const isPlayerReady = (player: Player): boolean => {
  for (let i = 0; i < 5; i++) {
    if (!player.lockedRegisters[i] && !player.registers[i]) {
      return false;
    }
  }
  return true;
};

// Check if all players are ready
export const allPlayersReady = (state: GameState): boolean => {
  return state.players.every(p => {
    const robot = state.robots.find(r => r.playerId === p.id);
    return !robot || robot.lives <= 0 || isPlayerReady(p);
  });
};

// Start execution phase
export const startExecution = (state: GameState): GameState => {
  if (!allPlayersReady(state)) return state;

  return {
    ...state,
    phase: 'execution',
    currentRegister: 0,
  };
};

// Check if position is valid
const isValidPosition = (board: Board, pos: Position): boolean => {
  return pos.x >= 0 && pos.x < board.width && pos.y >= 0 && pos.y < board.height;
};

// Check if movement is blocked by wall
const isBlockedByWall = (board: Board, from: Position, to: Position, direction: Direction): boolean => {
  // Check wall on the source cell
  const fromCell = board.cells[from.y]?.[from.x];
  if (fromCell?.walls[direction]) return true;

  // Check wall on the destination cell
  const toCell = board.cells[to.y]?.[to.x];
  if (toCell?.walls[oppositeDirection(direction)]) return true;

  return false;
};

// Get robot at position
const getRobotAtPosition = (robots: Robot[], pos: Position): Robot | undefined => {
  return robots.find(r => r.position.x === pos.x && r.position.y === pos.y && r.lives > 0);
};

// Try to push robots
const tryPush = (
  board: Board,
  robots: Robot[],
  pusher: Robot,
  direction: Direction,
  animations: AnimationStep[]
): { success: boolean; robots: Robot[] } => {
  const delta = getDirectionDelta(direction);
  const targetPos = {
    x: pusher.position.x + delta.x,
    y: pusher.position.y + delta.y,
  };

  // Check if blocked by wall
  if (isBlockedByWall(board, pusher.position, targetPos, direction)) {
    return { success: false, robots };
  }

  // Check if position is off the board
  if (!isValidPosition(board, targetPos)) {
    // Robot falls off
    const newRobots = robots.map(r => {
      if (r.id === pusher.id) {
        return { ...r, damage: 10 };
      }
      return r;
    });
    animations.push({
      type: 'destroy',
      robotId: pusher.id,
      from: pusher.position,
    });
    return { success: true, robots: newRobots };
  }

  // Check if there's a robot at the target position
  const blockingRobot = getRobotAtPosition(robots, targetPos);
  if (blockingRobot) {
    // Try to push the blocking robot first
    const pushResult = tryPush(board, robots, blockingRobot, direction, animations);
    if (!pushResult.success) {
      return { success: false, robots };
    }
    robots = pushResult.robots;
  }

  // Move the pusher
  const oldPos = { ...pusher.position };
  const newRobots = robots.map(r => {
    if (r.id === pusher.id) {
      return { ...r, position: targetPos };
    }
    return r;
  });

  animations.push({
    type: 'move',
    robotId: pusher.id,
    from: oldPos,
    to: targetPos,
  });

  return { success: true, robots: newRobots };
};

// Execute a single card
const executeCard = (
  board: Board,
  robots: Robot[],
  robot: Robot,
  card: Card,
  animations: AnimationStep[]
): Robot[] => {
  if (robot.lives <= 0) return robots;

  let newRobots = [...robots];

  switch (card.type) {
    case 'move1':
    case 'move2':
    case 'move3': {
      const steps = card.type === 'move1' ? 1 : card.type === 'move2' ? 2 : 3;
      for (let i = 0; i < steps; i++) {
        const currentRobot = newRobots.find(r => r.id === robot.id)!;
        if (currentRobot.lives <= 0) break;
        const result = tryPush(board, newRobots, currentRobot, currentRobot.direction, animations);
        newRobots = result.robots;
        if (!result.success) break;
      }
      break;
    }

    case 'backup': {
      const currentRobot = newRobots.find(r => r.id === robot.id)!;
      const backDirection = turnAround(currentRobot.direction);
      const result = tryPush(board, newRobots, currentRobot, backDirection, animations);
      newRobots = result.robots;
      break;
    }

    case 'turnLeft': {
      const oldDir = robot.direction;
      newRobots = newRobots.map(r => {
        if (r.id === robot.id) {
          return { ...r, direction: turnLeft(r.direction) };
        }
        return r;
      });
      animations.push({
        type: 'rotate',
        robotId: robot.id,
        fromDirection: oldDir,
        toDirection: turnLeft(oldDir),
      });
      break;
    }

    case 'turnRight': {
      const oldDir = robot.direction;
      newRobots = newRobots.map(r => {
        if (r.id === robot.id) {
          return { ...r, direction: turnRight(r.direction) };
        }
        return r;
      });
      animations.push({
        type: 'rotate',
        robotId: robot.id,
        fromDirection: oldDir,
        toDirection: turnRight(oldDir),
      });
      break;
    }

    case 'uTurn': {
      const oldDir = robot.direction;
      newRobots = newRobots.map(r => {
        if (r.id === robot.id) {
          return { ...r, direction: turnAround(r.direction) };
        }
        return r;
      });
      animations.push({
        type: 'rotate',
        robotId: robot.id,
        fromDirection: oldDir,
        toDirection: turnAround(oldDir),
      });
      break;
    }
  }

  return newRobots;
};

// Process board elements (conveyors, gears, etc.)
const processBoardElements = (
  board: Board,
  robots: Robot[],
  animations: AnimationStep[],
  expressOnly: boolean = false
): Robot[] => {
  let newRobots = [...robots];

  // Process conveyors
  const movements: Map<string, { from: Position; to: Position; direction: Direction }> = new Map();

  for (const robot of newRobots) {
    if (robot.lives <= 0) continue;

    const cell = board.cells[robot.position.y]?.[robot.position.x];
    if (!cell) continue;

    let conveyorDir: Direction | null = null;

    if (cell.type === 'expressConveyorNorth') conveyorDir = 'north';
    else if (cell.type === 'expressConveyorEast') conveyorDir = 'east';
    else if (cell.type === 'expressConveyorSouth') conveyorDir = 'south';
    else if (cell.type === 'expressConveyorWest') conveyorDir = 'west';
    else if (!expressOnly) {
      if (cell.type === 'conveyorNorth') conveyorDir = 'north';
      else if (cell.type === 'conveyorEast') conveyorDir = 'east';
      else if (cell.type === 'conveyorSouth') conveyorDir = 'south';
      else if (cell.type === 'conveyorWest') conveyorDir = 'west';
    }

    if (conveyorDir) {
      const delta = getDirectionDelta(conveyorDir);
      const targetPos = {
        x: robot.position.x + delta.x,
        y: robot.position.y + delta.y,
      };

      if (!isBlockedByWall(board, robot.position, targetPos, conveyorDir)) {
        movements.set(robot.id, { from: robot.position, to: targetPos, direction: conveyorDir });
      }
    }
  }

  // Check for collisions - if two robots would move to the same spot, neither moves
  const destinationCounts: Map<string, string[]> = new Map();
  for (const [robotId, movement] of movements) {
    const key = `${movement.to.x},${movement.to.y}`;
    const existing = destinationCounts.get(key) || [];
    existing.push(robotId);
    destinationCounts.set(key, existing);
  }

  // Also check if a robot would move into a stationary robot
  for (const [robotId, movement] of movements) {
    const robotAtDest = newRobots.find(
      r => r.id !== robotId &&
           r.position.x === movement.to.x &&
           r.position.y === movement.to.y &&
           r.lives > 0 &&
           !movements.has(r.id)
    );
    if (robotAtDest) {
      movements.delete(robotId);
    }
  }

  // Remove movements that would result in collision
  for (const [, robotIds] of destinationCounts) {
    if (robotIds.length > 1) {
      for (const robotId of robotIds) {
        movements.delete(robotId);
      }
    }
  }

  // Apply valid movements
  for (const [robotId, movement] of movements) {
    const robot = newRobots.find(r => r.id === robotId);
    if (!robot) continue;

    // Check for pits and off-board
    if (!isValidPosition(board, movement.to)) {
      newRobots = newRobots.map(r => {
        if (r.id === robotId) {
          return { ...r, damage: 10 };
        }
        return r;
      });
      animations.push({ type: 'destroy', robotId, from: robot.position });
    } else {
      newRobots = newRobots.map(r => {
        if (r.id === robotId) {
          return { ...r, position: movement.to };
        }
        return r;
      });
      animations.push({ type: 'move', robotId, from: movement.from, to: movement.to });

      // Check if entering conveyor that turns
      const destCell = board.cells[movement.to.y]?.[movement.to.x];
      if (destCell) {
        let destDir: Direction | null = null;
        if (destCell.type.includes('conveyorNorth') || destCell.type.includes('ConveyorNorth')) destDir = 'north';
        else if (destCell.type.includes('conveyorEast') || destCell.type.includes('ConveyorEast')) destDir = 'east';
        else if (destCell.type.includes('conveyorSouth') || destCell.type.includes('ConveyorSouth')) destDir = 'south';
        else if (destCell.type.includes('conveyorWest') || destCell.type.includes('ConveyorWest')) destDir = 'west';

        if (destDir && destDir !== movement.direction) {
          // Rotate robot based on conveyor turn
          const fromDir = movement.direction;
          let newDir = robot.direction;

          if (turnRight(fromDir) === destDir) {
            newDir = turnRight(robot.direction);
          } else if (turnLeft(fromDir) === destDir) {
            newDir = turnLeft(robot.direction);
          }

          if (newDir !== robot.direction) {
            newRobots = newRobots.map(r => {
              if (r.id === robotId) {
                return { ...r, direction: newDir };
              }
              return r;
            });
            animations.push({
              type: 'rotate',
              robotId,
              fromDirection: robot.direction,
              toDirection: newDir,
            });
          }
        }
      }
    }
  }

  // Process gears (only on non-express pass)
  if (!expressOnly) {
    for (const robot of newRobots) {
      if (robot.lives <= 0) continue;

      const cell = board.cells[robot.position.y]?.[robot.position.x];
      if (!cell) continue;

      if (cell.type === 'gearClockwise') {
        const oldDir = robot.direction;
        newRobots = newRobots.map(r => {
          if (r.id === robot.id) {
            return { ...r, direction: turnRight(r.direction) };
          }
          return r;
        });
        animations.push({
          type: 'rotate',
          robotId: robot.id,
          fromDirection: oldDir,
          toDirection: turnRight(oldDir),
        });
      } else if (cell.type === 'gearCounterClockwise') {
        const oldDir = robot.direction;
        newRobots = newRobots.map(r => {
          if (r.id === robot.id) {
            return { ...r, direction: turnLeft(r.direction) };
          }
          return r;
        });
        animations.push({
          type: 'rotate',
          robotId: robot.id,
          fromDirection: oldDir,
          toDirection: turnLeft(oldDir),
        });
      }
    }
  }

  return newRobots;
};

// Check for pits
const checkPits = (board: Board, robots: Robot[], animations: AnimationStep[]): Robot[] => {
  return robots.map(robot => {
    if (robot.lives <= 0) return robot;

    const cell = board.cells[robot.position.y]?.[robot.position.x];
    if (cell?.type === 'pit') {
      animations.push({ type: 'destroy', robotId: robot.id, from: robot.position });
      return { ...robot, damage: 10 };
    }
    return robot;
  });
};

// Fire lasers
const fireLasers = (
  board: Board,
  robots: Robot[],
  animations: AnimationStep[]
): Robot[] => {
  let newRobots = [...robots];

  // Board lasers
  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      const cell = board.cells[y][x];
      if (!cell.laser) continue;

      const laserDir = cell.laser.direction;
      const strength = cell.laser.strength;
      let pos = { x, y };

      // Trace laser path
      while (true) {
        const delta = getDirectionDelta(laserDir);
        const nextPos = { x: pos.x + delta.x, y: pos.y + delta.y };

        // Check for wall blocking laser
        if (isBlockedByWall(board, pos, nextPos, laserDir)) break;

        pos = nextPos;

        // Off board?
        if (!isValidPosition(board, pos)) break;

        // Hit a robot?
        const hitRobot = getRobotAtPosition(newRobots, pos);
        if (hitRobot && hitRobot.lives > 0) {
          newRobots = newRobots.map(r => {
            if (r.id === hitRobot.id) {
              return { ...r, damage: r.damage + strength };
            }
            return r;
          });
          animations.push({
            type: 'damage',
            robotId: hitRobot.id,
            damageAmount: strength,
          });
          break;
        }
      }
    }
  }

  // Robot lasers
  for (const robot of newRobots) {
    if (robot.lives <= 0) continue;

    let pos = { ...robot.position };
    const laserDir = robot.direction;

    while (true) {
      const delta = getDirectionDelta(laserDir);
      const nextPos = { x: pos.x + delta.x, y: pos.y + delta.y };

      if (isBlockedByWall(board, pos, nextPos, laserDir)) break;

      pos = nextPos;

      if (!isValidPosition(board, pos)) break;

      const hitRobot = getRobotAtPosition(newRobots, pos);
      if (hitRobot && hitRobot.id !== robot.id && hitRobot.lives > 0) {
        newRobots = newRobots.map(r => {
          if (r.id === hitRobot.id) {
            return { ...r, damage: r.damage + 1 };
          }
          return r;
        });
        animations.push({
          type: 'damage',
          robotId: hitRobot.id,
          damageAmount: 1,
        });
        break;
      }
    }
  }

  return newRobots;
};

// Check checkpoints
const checkCheckpoints = (
  board: Board,
  robots: Robot[],
  totalCheckpoints: number,
  animations: AnimationStep[]
): { robots: Robot[]; winner: string | null } => {
  let winner: string | null = null;

  const newRobots = robots.map(robot => {
    if (robot.lives <= 0) return robot;

    const cell = board.cells[robot.position.y]?.[robot.position.x];
    if (cell?.type === 'checkpoint' && cell.checkpointNumber === robot.checkpointsReached + 1) {
      const newRobot = {
        ...robot,
        checkpointsReached: robot.checkpointsReached + 1,
        lastCheckpoint: { ...robot.position },
      };

      animations.push({
        type: 'checkpoint',
        robotId: robot.id,
      });

      if (newRobot.checkpointsReached >= totalCheckpoints) {
        winner = robot.playerId;
      }

      return newRobot;
    }

    // Repair sites also act as save points
    if (cell?.type === 'repairSite') {
      return { ...robot, lastCheckpoint: { ...robot.position } };
    }

    return robot;
  });

  return { robots: newRobots, winner };
};

// Repair robots on repair sites
const repairRobots = (board: Board, robots: Robot[]): Robot[] => {
  return robots.map(robot => {
    if (robot.lives <= 0) return robot;

    const cell = board.cells[robot.position.y]?.[robot.position.x];
    if (cell?.type === 'repairSite') {
      return { ...robot, damage: Math.max(0, robot.damage - 1) };
    }
    return robot;
  });
};

// Respawn destroyed robots
const respawnRobots = (
  board: Board,
  robots: Robot[],
  animations: AnimationStep[]
): Robot[] => {
  return robots.map(robot => {
    if (robot.damage >= 10 && robot.lives > 0) {
      const newRobot = {
        ...robot,
        damage: 2, // Respawn with 2 damage
        lives: robot.lives - 1,
        position: robot.lastCheckpoint || { x: 0, y: board.height - 1 },
        direction: 'north' as Direction,
      };

      if (newRobot.lives > 0) {
        animations.push({
          type: 'respawn',
          robotId: robot.id,
          to: newRobot.position,
        });
      }

      return newRobot;
    }
    return robot;
  });
};

// Execute one register for all robots
export const executeRegister = (state: GameState): ExecutionResult => {
  const animations: AnimationStep[] = [];
  let robots = [...state.robots];
  const board = state.board;

  // Get cards for current register, sorted by priority (highest first)
  const registerCards: { robot: Robot; card: Card; player: Player }[] = [];

  for (const player of state.players) {
    const robot = robots.find(r => r.playerId === player.id);
    if (!robot || robot.lives <= 0) continue;

    const card = player.registers[state.currentRegister];
    if (card) {
      registerCards.push({ robot, card, player });
    }
  }

  registerCards.sort((a, b) => b.card.priority - a.card.priority);

  // Execute each card
  for (const { robot, card } of registerCards) {
    const currentRobot = robots.find(r => r.id === robot.id);
    if (!currentRobot || currentRobot.lives <= 0) continue;

    robots = executeCard(board, robots, currentRobot, card, animations);
  }

  // Check pits after movement
  robots = checkPits(board, robots, animations);

  // Express conveyors move first
  robots = processBoardElements(board, robots, animations, true);
  robots = checkPits(board, robots, animations);

  // All conveyors move
  robots = processBoardElements(board, robots, animations, false);
  robots = checkPits(board, robots, animations);

  // Fire lasers
  robots = fireLasers(board, robots, animations);

  // Check checkpoints
  const checkpointResult = checkCheckpoints(board, robots, state.totalCheckpoints, animations);
  robots = checkpointResult.robots;

  // Respawn destroyed robots
  robots = respawnRobots(board, robots, animations);

  const newState: GameState = {
    ...state,
    robots,
    winner: checkpointResult.winner,
    currentRegister: state.currentRegister + 1,
  };

  // Check if execution phase is complete
  if (newState.currentRegister >= 5 || newState.winner) {
    newState.phase = newState.winner ? 'gameOver' : 'cleanup';
  }

  return { newState, animations };
};

// End of round cleanup
export const cleanup = (state: GameState): GameState => {
  let newState = { ...state };

  // Repair robots on repair sites
  newState.robots = repairRobots(state.board, state.robots);

  // Deal new cards
  newState = dealCards(newState);

  // Reset to programming phase
  newState.phase = 'programming';
  newState.currentRegister = 0;

  return newState;
};

// Get card display info
export const getCardDisplayInfo = (type: CardType): { name: string; symbol: string } => {
  switch (type) {
    case 'move1': return { name: 'Move 1', symbol: '1' };
    case 'move2': return { name: 'Move 2', symbol: '2' };
    case 'move3': return { name: 'Move 3', symbol: '3' };
    case 'backup': return { name: 'Back Up', symbol: 'B' };
    case 'turnLeft': return { name: 'Turn Left', symbol: 'L' };
    case 'turnRight': return { name: 'Turn Right', symbol: 'R' };
    case 'uTurn': return { name: 'U-Turn', symbol: 'U' };
  }
};
