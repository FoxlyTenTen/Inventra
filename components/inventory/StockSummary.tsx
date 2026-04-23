'use client';

import { Package, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { InventoryItem } from './types';
import { calculateAlertStatus } from './inventoryUtils';

interface StockSummaryProps {
  items: InventoryItem[];
}

export function StockSummary({ items }: StockSummaryProps) {
  const statuses = items.map(calculateAlertStatus);
  const normal = statuses.filter(s => s === 'normal').length;
  const low = statuses.filter(s => s === 'low').length;
  const expiredOrSoon = statuses.filter(s => s === 'expired' || s === 'expiring_soon').length;

  const cards = [
    {
      label: 'Total Items',
      value: items.length,
      icon: Package,
      gradient: 'from-blue-500/20 to-blue-600/5',
      border: 'border-blue-500/30',
      iconColor: 'text-blue-400',
      valueColor: 'text-blue-300',
    },
    {
      label: 'Normal Stock',
      value: normal,
      icon: CheckCircle,
      gradient: 'from-green-500/20 to-green-600/5',
      border: 'border-green-500/30',
      iconColor: 'text-green-400',
      valueColor: 'text-green-300',
    },
    {
      label: 'Low Stock',
      value: low,
      icon: AlertTriangle,
      gradient: 'from-yellow-500/20 to-yellow-600/5',
      border: 'border-yellow-500/30',
      iconColor: 'text-yellow-400',
      valueColor: 'text-yellow-300',
    },
    {
      label: 'Expired / Expiring',
      value: expiredOrSoon,
      icon: XCircle,
      gradient: 'from-red-500/20 to-red-600/5',
      border: 'border-red-500/30',
      iconColor: 'text-red-400',
      valueColor: 'text-red-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`p-4 rounded-2xl bg-gradient-to-br ${card.gradient} border ${card.border} backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between mb-3">
              <Icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <p className={`text-3xl font-bold ${card.valueColor} tabular-nums`}>{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
