import React from 'react';
import { Clock } from 'lucide-react';
import { isOpenNow } from '../utils/openingHours';

interface OpeningStatusProps {
  openingHours: string | undefined;
}

export function OpeningStatus({ openingHours }: OpeningStatusProps) {
  const isOpen = isOpenNow(openingHours);

  if (isOpen === null) return null;

  return (
    <div className={`opening-status ${isOpen ? 'open' : 'closed'}`}>
      <Clock size={14} />
      <span>{isOpen ? 'Ouvert' : 'Fermé'}</span>
    </div>
  );
}