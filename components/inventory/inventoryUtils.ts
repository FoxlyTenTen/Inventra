import type { AlertStatus, InventoryItem } from './types';

export function calculateAlertStatus(item: InventoryItem): AlertStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(item.expiry_date);
  expiry.setHours(0, 0, 0, 0);
  const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

  if (expiry <= today) return 'expired';
  if (expiry <= threeDaysFromNow) return 'expiring_soon';
  if (item.current_stock < item.min_stock) return 'low';
  return 'normal';
}

export function getStatusLabel(status: AlertStatus): string {
  switch (status) {
    case 'normal': return 'Normal';
    case 'low': return 'Low Stock';
    case 'expiring_soon': return 'Expiring Soon';
    case 'expired': return 'Expired';
  }
}

export function getStatusBadgeClass(status: AlertStatus): string {
  switch (status) {
    case 'normal':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'low':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'expiring_soon':
      return 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
    case 'expired':
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
  }
}

export function getStatusRowClass(status: AlertStatus): string {
  switch (status) {
    case 'normal': return '';
    case 'low': return 'bg-yellow-500/5';
    case 'expiring_soon': return 'bg-orange-500/5';
    case 'expired': return 'bg-red-500/5';
  }
}

export function getStatusDotClass(status: AlertStatus): string {
  switch (status) {
    case 'normal': return 'bg-green-400';
    case 'low': return 'bg-yellow-400';
    case 'expiring_soon': return 'bg-orange-400';
    case 'expired': return 'bg-red-400';
  }
}

// Hex color for Three.js meshes
export function getStatusHexColor(status: AlertStatus): number {
  switch (status) {
    case 'normal': return 0x22c55e;
    case 'low': return 0xeab308;
    case 'expiring_soon': return 0xf97316;
    case 'expired': return 0xef4444;
  }
}

export function getWorstStatus(statuses: AlertStatus[]): AlertStatus {
  if (statuses.includes('expired')) return 'expired';
  if (statuses.includes('expiring_soon')) return 'expiring_soon';
  if (statuses.includes('low')) return 'low';
  return 'normal';
}

export function formatRelativeExpiry(expiryDate: string): { text: string; className: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Expired ${Math.abs(diffDays)}d ago`, className: 'text-red-400 font-semibold' };
  }
  if (diffDays === 0) {
    return { text: 'Expires today', className: 'text-red-400 font-semibold' };
  }
  if (diffDays <= 3) {
    return { text: `In ${diffDays} day${diffDays === 1 ? '' : 's'}`, className: 'text-orange-400 font-semibold' };
  }
  if (diffDays <= 14) {
    return { text: `In ${diffDays} days`, className: 'text-yellow-400' };
  }
  return { text: `In ${diffDays} days`, className: 'text-muted-foreground' };
}

export function suggestReorder(items: InventoryItem[]): Array<{ item: InventoryItem; reorderQty: number }> {
  return items
    .filter(item => calculateAlertStatus(item) === 'low' || item.current_stock < item.min_stock)
    .map(item => ({ item, reorderQty: item.max_stock - item.current_stock }));
}

export function exportReorderCSV(reorderList: Array<{ item: InventoryItem; reorderQty: number }>): void {
  const headers = ['Item ID', 'Item Name', 'Category', 'Current Stock', 'Min Stock', 'Max Stock', 'Reorder Qty', 'Unit'];
  const rows = reorderList.map(({ item, reorderQty }) => [
    item.item_id,
    item.item_name,
    item.category,
    item.current_stock,
    item.min_stock,
    item.max_stock,
    reorderQty,
    item.unit,
  ]);
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reorder_list.csv';
  a.click();
  URL.revokeObjectURL(url);
}
