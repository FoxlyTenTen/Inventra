'use client';

import { mockInventory } from './mockInventory';

interface LocationSelectorProps {
  selectedKiosk: string;
  onSelect: (kioskId: string) => void;
}

export function LocationSelector({ selectedKiosk, onSelect }: LocationSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground font-medium">Location:</span>
      <div className="flex gap-2">
        {Object.values(mockInventory).map(kiosk => (
          <button
            key={kiosk.kiosk_id}
            onClick={() => onSelect(kiosk.kiosk_id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedKiosk === kiosk.kiosk_id
                ? 'bg-primary text-primary-foreground shadow-md scale-105'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            {kiosk.kiosk_name}
          </button>
        ))}
      </div>
    </div>
  );
}
