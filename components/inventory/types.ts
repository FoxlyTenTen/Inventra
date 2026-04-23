export type AlertStatus = 'normal' | 'low' | 'expiring_soon' | 'expired';

export interface InventoryItem {
  item_id: string;
  item_name: string;
  category: string;
  unit: string;
  icon: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  expiry_date: string; // YYYY-MM-DD
  rack_position: string;
}

export interface Rack {
  rack_id: string;
  rack_name: string;
  type: 'fridge' | 'shelf' | 'freezer';
  location_3d: { x: number; y: number; z: number };
  items: string[]; // item_ids
}

export interface KioskData {
  kiosk_id: string;
  kiosk_name: string;
  items: InventoryItem[];
  racks: Rack[];
}

export interface MockInventory {
  [kiosk_id: string]: KioskData;
}
