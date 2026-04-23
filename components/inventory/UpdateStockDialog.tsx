'use client';

import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import type { InventoryItem } from './types';
import { calculateAlertStatus, getStatusBadgeClass, getStatusLabel } from './inventoryUtils';

interface UpdateStockDialogProps {
  item: InventoryItem | null;
  onSave: (itemId: string, newQty: number) => void;
  onClose: () => void;
}

export function UpdateStockDialog({ item, onSave, onClose }: UpdateStockDialogProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (item) setValue(String(item.current_stock));
  }, [item]);

  if (!item) return null;

  const status = calculateAlertStatus(item);
  const newQty = Number(value);
  const isValid = !isNaN(newQty) && newQty >= 0;
  const stockPercent = Math.min(100, (newQty / item.max_stock) * 100);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{item.icon}</span>
            <div>
              <h3 className="font-semibold text-foreground">{item.item_name}</h3>
              <p className="text-xs text-muted-foreground">{item.category} • {item.item_id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Current status */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
            <div className="text-sm text-muted-foreground">
              Current: <span className="text-foreground font-medium">{item.current_stock} {item.unit}</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeClass(status)}`}>
              {getStatusLabel(status)}
            </span>
          </div>

          {/* Range info */}
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Min: <span className="text-yellow-400 font-semibold">{item.min_stock}</span></span>
            <span>Max: <span className="text-green-400 font-semibold">{item.max_stock}</span></span>
            <span>Unit: <span className="text-foreground">{item.unit}</span></span>
          </div>

          {/* Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              New Quantity ({item.unit})
            </label>
            <input
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              min={0}
              max={item.max_stock * 2}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-lg font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              autoFocus
            />
          </div>

          {/* Stock preview bar */}
          {isValid && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Stock level</span>
                <span>{newQty} / {item.max_stock}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    stockPercent < (item.min_stock / item.max_stock) * 100
                      ? 'bg-red-500'
                      : stockPercent < 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${stockPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => isValid && (onSave(item.item_id, newQty), onClose())}
            disabled={!isValid}
            className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-all text-sm font-medium shadow-md"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
