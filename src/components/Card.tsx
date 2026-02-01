import type { Card as CardType } from '../game/types';
import { getCardDisplayInfo } from '../game/gameLogic';
import './Card.css';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  small?: boolean;
}

export const Card = ({ card, onClick, selected, disabled, small }: CardProps) => {
  const { name, symbol } = getCardDisplayInfo(card.type);

  const getCardClass = (): string => {
    const classes = ['program-card'];
    if (selected) classes.push('selected');
    if (disabled) classes.push('disabled');
    if (small) classes.push('small');

    // Card type specific styling
    if (card.type.includes('move')) classes.push('card-move');
    else if (card.type === 'backup') classes.push('card-backup');
    else if (card.type.includes('turn') || card.type === 'uTurn') classes.push('card-turn');

    return classes.join(' ');
  };

  const getSymbolDisplay = (): string => {
    switch (card.type) {
      case 'move1': return '→';
      case 'move2': return '→→';
      case 'move3': return '→→→';
      case 'backup': return '←';
      case 'turnLeft': return '↰';
      case 'turnRight': return '↱';
      case 'uTurn': return '↩';
      default: return symbol;
    }
  };

  return (
    <div
      className={getCardClass()}
      onClick={disabled ? undefined : onClick}
    >
      <div className="card-symbol">{getSymbolDisplay()}</div>
      <div className="card-name">{name}</div>
      <div className="card-priority">{card.priority}</div>
    </div>
  );
};
