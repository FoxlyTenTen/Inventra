'use client';

import { useEffect, useState } from 'react';
import { MapPin, TrendingUp, AlertTriangle, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LocationStats {
  location_id: string;
  location_name: string;
  address: string;
  criticalStock: number;
  warningStock: number;
  expiryItems: number;
  predictedOrders: number | null;
}

export default function LocationPage() {
  const [stats, setStats] = useState<LocationStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: locations } = await supabase
        .from('locations')
        .select('location_id, location_name, address')
        .order('location_name');

      if (!locations || locations.length === 0) { setLoading(false); return; }

      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      const results = await Promise.all(
        locations.map(async (loc) => {
          const [stockRes, expiryRes, ordersRes] = await Promise.all([
            supabase.from('inventory_stock').select('status').eq('location_id', loc.location_id),
            supabase.from('inventory_expiry').select('item_name').eq('location_id', loc.location_id),
            supabase
              .from('pos_orders_daily')
              .select('predicted_orders')
              .eq('location_id', loc.location_id)
              .eq('business_date', tomorrow)
              .maybeSingle(),
          ]);

          const stock = stockRes.data ?? [];
          return {
            ...loc,
            criticalStock: stock.filter(s => s.status === 'critical').length,
            warningStock: stock.filter(s => s.status === 'warning').length,
            expiryItems: (expiryRes.data ?? []).length,
            predictedOrders: ordersRes.data?.predicted_orders ?? null,
          };
        }),
      );

      setStats(results);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Loading locations...
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No locations found. Run the multi-location SQL migration in Supabase SQL Editor first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <MapPin className="h-7 w-7 text-primary" />
          Location & Strategy
        </h1>
        <p className="text-muted-foreground mt-1">Live snapshot across all outlet locations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((loc) => (
          <Card key={loc.location_id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold">{loc.location_name}</p>
                  <p className="text-xs text-muted-foreground font-normal mt-0.5">{loc.address}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{loc.location_id}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <TrendingUp className="h-4 w-4 text-blue-400 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Predicted Orders Tomorrow</p>
                  <p className="text-lg font-bold">
                    {loc.predictedOrders != null ? loc.predictedOrders : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Critical</p>
                    <p className="text-base font-bold text-red-400">{loc.criticalStock}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Warning</p>
                    <p className="text-base font-bold text-yellow-400">{loc.warningStock}</p>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-2 p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Package className="h-4 w-4 text-orange-400 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Expiring</p>
                    <p className="text-base font-bold text-orange-400">{loc.expiryItems}</p>
                  </div>
                </div>
              </div>

              {loc.criticalStock > 0 && (
                <p className="text-xs text-red-400 font-medium">
                  {loc.criticalStock} item{loc.criticalStock !== 1 ? 's' : ''} critically low — reorder urgently
                </p>
              )}
              {loc.criticalStock === 0 && loc.warningStock === 0 && (
                <p className="text-xs text-green-400 font-medium">All stock levels healthy</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
