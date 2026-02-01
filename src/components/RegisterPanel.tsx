import type { Player } from '../game/types';
import { Card } from './Card';
import './RegisterPanel.css';

interface RegisterPanelProps {
  player: Player;
  onRemoveCard: (registerIndex: number) => void;
  disabled?: boolean;
}

export const RegisterPanel = ({ player, onRemoveCard, disabled }: RegisterPanelProps) => {
  return (
    <div className="register-panel">
      <h3>Program Registers</h3>
      <div className="registers">
        {player.registers.map((card, index) => (
          <div
            key={index}
            className={`register-slot ${player.lockedRegisters[index] ? 'locked' : ''}`}
          >
            <div className="register-number">{index + 1}</div>
            {card ? (
              <Card
                card={card}
                onClick={() => !disabled && !player.lockedRegisters[index] && onRemoveCard(index)}
                disabled={disabled || player.lockedRegisters[index]}
                small
              />
            ) : (
              <div className="empty-register">
                {player.lockedRegisters[index] ? '🔒' : 'Empty'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
