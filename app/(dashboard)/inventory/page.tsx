'use client';

import { useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as Tabs from '@radix-ui/react-tabs';
import { Box, LayoutDashboard, Loader2 } from 'lucide-react';
import { mockInventory } from '@/components/inventory/mockInventory';
import { LocationSelector } from '@/components/inventory/LocationSelector';
import { RackDetailsPanel } from '@/components/inventory/RackDetailsPanel';
import { UpdateStockDialog } from '@/components/inventory/UpdateStockDialog';
import { StockSummary } from '@/components/inventory/StockSummary';
import { StockTable } from '@/components/inventory/StockTable';
import type { MockInventory, InventoryItem, Rack } from '@/components/inventory/types';

const ThreeDStoreView = dynamic(
  () => import('@/components/inventory/ThreeDStoreView'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-[#0a0a18] rounded-xl">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading 3D Store...</p>
        </div>
      </div>
    ),
  }
);

export default function InventoryPage() {
  const [inventoryData, setInventoryData] = useState<MockInventory>(mockInventory);
  const [selectedKiosk, setSelectedKiosk] = useState('kiosk_1');
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  const [updateTarget, setUpdateTarget] = useState<InventoryItem | null>(null);
  const [flashRackId, setFlashRackId] = useState<string | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const kiosk = inventoryData[selectedKiosk];
  const selectedRack: Rack | null = kiosk.racks.find(r => r.rack_id === selectedRackId) ?? null;
  const rackItems = selectedRack
    ? kiosk.items.filter(item => selectedRack.items.includes(item.item_id))
    : [];

  const handleKioskSwitch = useCallback((kioskId: string) => {
    setSelectedKiosk(kioskId);
    setSelectedRackId(null);
  }, []);

  const handleUpdateStock = useCallback((itemId: string, newQty: number) => {
    // Find which rack this item belongs to for flash effect
    const rack = kiosk.racks.find(r => r.items.includes(itemId));

    setInventoryData(prev => ({
      ...prev,
      [selectedKiosk]: {
        ...prev[selectedKiosk],
        items: prev[selectedKiosk].items.map(item =>
          item.item_id === itemId ? { ...item, current_stock: newQty } : item
        ),
      },
    }));

    // Trigger rack flash animation
    if (rack) {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      setFlashRackId(rack.rack_id);
      flashTimerRef.current = setTimeout(() => setFlashRackId(null), 600);
    }
  }, [selectedKiosk, kiosk]);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Page header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Box className="h-6 w-6 text-primary" />
            Inventory & Waste
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{kiosk.kiosk_name}</p>
        </div>
        <LocationSelector selectedKiosk={selectedKiosk} onSelect={handleKioskSwitch} />
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="3d" className="flex flex-col flex-1 min-h-0">
        <Tabs.List className="flex gap-1 p-1 rounded-xl bg-muted w-fit shrink-0">
          <Tabs.Trigger
            value="3d"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Box className="h-4 w-4" />
            3D Store View
          </Tabs.Trigger>
          <Tabs.Trigger
            value="dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all text-muted-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            Stock Dashboard
          </Tabs.Trigger>
        </Tabs.List>

        {/* 3D View Tab */}
        <Tabs.Content value="3d" className="flex-1 min-h-0 mt-3">
          <div className="relative h-full min-h-[500px] rounded-xl overflow-hidden border border-border">
            <ThreeDStoreView
              kioskData={kiosk}
              onRackSelect={setSelectedRackId}
              selectedRackId={selectedRackId}
              flashRackId={flashRackId}
            />
            <RackDetailsPanel
              rack={selectedRack}
              items={rackItems}
              onClose={() => setSelectedRackId(null)}
              onUpdateStock={setUpdateTarget}
            />
          </div>
        </Tabs.Content>

        {/* Dashboard Tab */}
        <Tabs.Content value="dashboard" className="flex-1 min-h-0 mt-3 overflow-y-auto">
          <div className="space-y-6 pb-6">
            <StockSummary items={kiosk.items} />
            <StockTable items={kiosk.items} onUpdateStock={setUpdateTarget} />
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* Update stock dialog (shared between both views) */}
      <UpdateStockDialog
        item={updateTarget}
        onSave={handleUpdateStock}
        onClose={() => setUpdateTarget(null)}
      />
    </div>
  );
}
