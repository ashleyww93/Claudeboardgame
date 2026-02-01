import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Board, Robot, Player, Direction, BoardCell } from '../game/types';
import { directionToAngle } from '../game/types';

interface GameBoard3DProps {
  board: Board;
  robots: Robot[];
  players: Player[];
}

// Colors for different cell types
const getCellColor = (cell: BoardCell): string => {
  switch (cell.type) {
    case 'pit': return '#1a1a1a';
    case 'conveyorNorth':
    case 'conveyorEast':
    case 'conveyorSouth':
    case 'conveyorWest':
      return '#8B8B00';
    case 'expressConveyorNorth':
    case 'expressConveyorEast':
    case 'expressConveyorSouth':
    case 'expressConveyorWest':
      return '#006B6B';
    case 'gearClockwise':
    case 'gearCounterClockwise':
      return '#8B4513';
    case 'checkpoint':
      return '#800080';
    case 'repairSite':
      return '#006400';
    default:
      return '#3a3a4a';
  }
};

// Get conveyor direction arrow rotation
const getConveyorRotation = (type: string): number => {
  if (type.includes('North')) return 0;
  if (type.includes('East')) return -Math.PI / 2;
  if (type.includes('South')) return Math.PI;
  if (type.includes('West')) return Math.PI / 2;
  return 0;
};

// Single cell component
const Cell3D = ({ cell, x, y }: { cell: BoardCell; x: number; y: number }) => {
  const color = getCellColor(cell);
  const isConveyor = cell.type.includes('conveyor') || cell.type.includes('Conveyor');
  const isGear = cell.type.includes('gear');
  const isCheckpoint = cell.type === 'checkpoint';
  const isRepair = cell.type === 'repairSite';
  const isPit = cell.type === 'pit';

  return (
    <group position={[x, 0, y]}>
      {/* Base tile */}
      <RoundedBox
        args={[0.95, isPit ? 0.1 : 0.2, 0.95]}
        radius={0.05}
        position={[0, isPit ? -0.15 : 0, 0]}
      >
        <meshStandardMaterial color={color} />
      </RoundedBox>

      {/* Conveyor arrow */}
      {isConveyor && (
        <group rotation={[0, getConveyorRotation(cell.type), 0]} position={[0, 0.15, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.15, 0.3, 3]} />
            <meshStandardMaterial
              color={cell.type.includes('express') ? '#00FFFF' : '#FFFF00'}
              emissive={cell.type.includes('express') ? '#004444' : '#444400'}
            />
          </mesh>
        </group>
      )}

      {/* Gear indicator */}
      {isGear && (
        <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.25, 0.05, 8, 6]} />
          <meshStandardMaterial
            color={cell.type === 'gearClockwise' ? '#FFA500' : '#00CED1'}
            emissive={cell.type === 'gearClockwise' ? '#442200' : '#003344'}
          />
        </mesh>
      )}

      {/* Checkpoint number */}
      {isCheckpoint && cell.checkpointNumber && (
        <Text
          position={[0, 0.2, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.5}
          color="#FF00FF"
          anchorX="center"
          anchorY="middle"
        >
          {cell.checkpointNumber}
        </Text>
      )}

      {/* Repair site wrench */}
      {isRepair && (
        <Text
          position={[0, 0.2, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.4}
          color="#00FF00"
          anchorX="center"
          anchorY="middle"
        >
          +
        </Text>
      )}

      {/* Pit hole effect */}
      {isPit && (
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.8, 0.3, 0.8]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
      )}
    </group>
  );
};

// Wall component
const Wall3D = ({ x, y, direction }: { x: number; y: number; direction: Direction }) => {
  let posX = x;
  let posZ = y;
  let rotY = 0;

  switch (direction) {
    case 'north':
      posZ -= 0.5;
      rotY = 0;
      break;
    case 'south':
      posZ += 0.5;
      rotY = 0;
      break;
    case 'east':
      posX += 0.5;
      rotY = Math.PI / 2;
      break;
    case 'west':
      posX -= 0.5;
      rotY = Math.PI / 2;
      break;
  }

  return (
    <mesh position={[posX, 0.35, posZ]} rotation={[0, rotY, 0]}>
      <boxGeometry args={[0.95, 0.5, 0.08]} />
      <meshStandardMaterial color="#FF8800" emissive="#442200" />
    </mesh>
  );
};

// Laser emitter and beam
const Laser3D = ({ x, y, direction, strength }: { x: number; y: number; direction: Direction; strength: number }) => {
  const beamLength = 10;
  let posX = x;
  let posZ = y;
  let rotY = 0;
  let beamOffsetX = 0;
  let beamOffsetZ = 0;

  switch (direction) {
    case 'north':
      rotY = 0;
      beamOffsetZ = -beamLength / 2;
      break;
    case 'south':
      rotY = Math.PI;
      beamOffsetZ = beamLength / 2;
      break;
    case 'east':
      rotY = -Math.PI / 2;
      beamOffsetX = beamLength / 2;
      break;
    case 'west':
      rotY = Math.PI / 2;
      beamOffsetX = -beamLength / 2;
      break;
  }

  const beamColor = strength > 1 ? '#FF4400' : '#FF0000';

  return (
    <group position={[posX, 0.4, posZ]}>
      {/* Laser beam */}
      <mesh position={[beamOffsetX, 0, beamOffsetZ]} rotation={[0, rotY, 0]}>
        <boxGeometry args={[0.02 * strength, 0.02, beamLength]} />
        <meshStandardMaterial
          color={beamColor}
          emissive={beamColor}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};

// Robot component
const Robot3D = ({ robot, player }: { robot: Robot; player: Player }) => {
  const meshRef = useRef<THREE.Group>(null);
  const angle = (directionToAngle[robot.direction] * Math.PI) / 180;

  // Subtle bobbing animation
  useFrame((state) => {
    if (meshRef.current && robot.lives > 0) {
      meshRef.current.position.y = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  if (robot.lives <= 0) return null;

  return (
    <group
      ref={meshRef}
      position={[robot.position.x, 0.4, robot.position.y]}
      rotation={[0, -angle, 0]}
    >
      {/* Robot body */}
      <RoundedBox args={[0.6, 0.4, 0.6]} radius={0.1}>
        <meshStandardMaterial color={player.color} metalness={0.6} roughness={0.3} />
      </RoundedBox>

      {/* Robot head/direction indicator */}
      <mesh position={[0, 0.1, -0.25]}>
        <coneGeometry args={[0.15, 0.25, 4]} />
        <meshStandardMaterial color="#FFFFFF" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.12, 0.1, -0.31]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.12, 0.1, -0.31]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#00FF00" emissive="#00FF00" emissiveIntensity={0.5} />
      </mesh>

      {/* Damage indicator - red glow when damaged */}
      {robot.damage > 0 && (
        <pointLight
          color="#FF0000"
          intensity={robot.damage * 0.2}
          distance={1}
          position={[0, 0.3, 0]}
        />
      )}

      {/* Player name */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.2}
        color={player.color}
        anchorX="center"
        anchorY="middle"
      >
        {player.name}
      </Text>

      {/* Checkpoint progress */}
      <Text
        position={[0, 0.45, 0]}
        fontSize={0.15}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {`CP:${robot.checkpointsReached}`}
      </Text>
    </group>
  );
};

// Main 3D scene
const Scene = ({ board, robots, players }: GameBoard3DProps) => {
  const centerX = (board.width - 1) / 2;
  const centerZ = (board.height - 1) / 2;

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
      <directionalLight position={[-10, 10, -10]} intensity={0.3} />
      <pointLight position={[centerX, 10, centerZ]} intensity={0.5} />

      {/* Board cells */}
      {board.cells.map((row, y) =>
        row.map((cell, x) => (
          <Cell3D key={`${x}-${y}`} cell={cell} x={x} y={y} />
        ))
      )}

      {/* Walls */}
      {board.cells.map((row, y) =>
        row.map((cell, x) => (
          <group key={`walls-${x}-${y}`}>
            {cell.walls.north && <Wall3D x={x} y={y} direction="north" />}
            {cell.walls.east && <Wall3D x={x} y={y} direction="east" />}
            {cell.walls.south && <Wall3D x={x} y={y} direction="south" />}
            {cell.walls.west && <Wall3D x={x} y={y} direction="west" />}
          </group>
        ))
      )}

      {/* Lasers */}
      {board.cells.map((row, y) =>
        row.map((cell, x) =>
          cell.laser ? (
            <Laser3D
              key={`laser-${x}-${y}`}
              x={x}
              y={y}
              direction={cell.laser.direction}
              strength={cell.laser.strength}
            />
          ) : null
        )
      )}

      {/* Robots */}
      {robots.map((robot) => {
        const player = players.find((p) => p.id === robot.playerId);
        if (!player) return null;
        return <Robot3D key={robot.id} robot={robot} player={player} />;
      })}

      {/* Floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerX, -0.3, centerZ]}>
        <planeGeometry args={[board.width + 2, board.height + 2]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[Math.max(board.width, board.height) + 2, Math.max(board.width, board.height) + 2, '#333344', '#222233']}
        position={[centerX, -0.29, centerZ]}
      />
    </>
  );
};

export const GameBoard3D = ({ board, robots, players }: GameBoard3DProps) => {
  const centerX = (board.width - 1) / 2;
  const centerZ = (board.height - 1) / 2;

  return (
    <div style={{ width: '100%', height: '600px', background: '#0a0a15', borderRadius: '8px' }}>
      <Canvas
        camera={{
          position: [centerX, 15, centerZ + 12],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        shadows
      >
        <Scene board={board} robots={robots} players={players} />
        <OrbitControls
          target={[centerX, 0, centerZ]}
          minDistance={5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
      </Canvas>
    </div>
  );
};
