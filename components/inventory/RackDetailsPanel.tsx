'use client';

import { X, Snowflake, Package, Thermometer, Pencil } from 'lucide-react';
import type { Rack, InventoryItem } from './types';
import { calculateAlertStatus, getStatusBadgeClass, getStatusLabel, getStatusDotClass, formatRelativeExpiry } from './inventoryUtils';

interface RackDetailsPanelProps {
  rack: Rack | null;
  items: InventoryItem[];
  onClose: () => void;
  onUpdateStock: (item: InventoryItem) => void;
}

function RackTypeIcon({ type }: { type: Rack['type'] }) {
  if (type === 'fridge') return <Snowflake className="h-5 w-5 text-blue-400" />;
  if (type === 'freezer') return <Thermometer className="h-5 w-5 text-cyan-400" />;
  return <Package className="h-5 w-5 text-amber-400" />;
}

export function RackDetailsPanel({ rack, items, onClose, onUpdateStock }: RackDetailsPanelProps) {
  const isOpen = rack !== null;

  return (
    <div
      className={`absolute top-0 right-0 h-full w-80 z-20 flex flex-col bg-card/95 backdrop-blur-md border-l border-border shadow-2xl transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {rack && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted">
                <RackTypeIcon type={rack.type} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-base">{rack.rack_name}</h3>
                <p className="text-xs text-muted-foreground capitalize">{rack.type} • {items.length} item{items.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                <Package className="h-8 w-8 mb-2 opacity-40" />
                <p>No items in this rack</p>
              </div>
            ) : (
              items.map(item => {
                const status = calculateAlertStatus(item);
                const expiry = formatRelativeExpiry(item.expiry_date);
                const stockPercent = Math.min(100, (item.current_stock / item.max_stock) * 100);
                const borderColor = {
                  normal: 'border-green-500/60',
                  low: 'border-yellow-500/60',
                  expiring_soon: 'border-orange-500/60',
                  expired: 'border-red-500/60',
                }[status];

                return (
                  <div
                    key={item.item_id}
                    className={`p-4 rounded-xl bg-muted/30 border-l-4 ${borderColor} border border-border/50 space-y-3`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="font-medium text-foreground text-sm">{item.item_name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${getStatusBadgeClass(status)}`}>
                        {getStatusLabel(status)}
                      </span>
                    </div>

                    {/* Stock bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground font-semibold">{item.current_stock} {item.unit}</span>
                        <span className="text-muted-foreground">max {item.max_stock}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            status === 'expired' || status === 'expiring_soon'
                              ? 'bg-red-500'
                              : status === 'low'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${stockPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Min: {item.min_stock}</span>
                        <span className={expiry.className}>{expiry.text}</span>
                      </div>
                    </div>

                    {/* Update button */}
                    <button
                      onClick={() => onUpdateStock(item)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                    >
                      <Pencil className="h-3 w-3" />
                      Update Stock
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
