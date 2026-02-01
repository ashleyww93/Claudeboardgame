import type { Card as CardType } from '../game/types';
import { Card } from './Card';
import './HandPanel.css';

interface HandPanelProps {
  cards: CardType[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string) => void;
  disabled?: boolean;
}

export const HandPanel = ({ cards, selectedCardId, onSelectCard, disabled }: HandPanelProps) => {
  return (
    <div className="hand-panel">
      <h3>Your Cards ({cards.length})</h3>
      <div className="hand-cards">
        {cards.map(card => (
          <Card
            key={card.id}
            card={card}
            selected={card.id === selectedCardId}
            onClick={() => onSelectCard(card.id)}
            disabled={disabled}
          />
        ))}
        {cards.length === 0 && (
          <div className="no-cards">No cards in hand</div>
        )}
      </div>
    </div>
  );
};
