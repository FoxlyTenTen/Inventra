"use client";

import { ShoppingCart, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { KPICard } from '@/components/KPICard';
import { AIInsightPanel } from '@/components/AIInsightPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const ordersData = [
  { date: 'Apr 15', actual: 120, predicted: 125 },
  { date: 'Apr 16', actual: 145, predicted: 142 },
  { date: 'Apr 17', actual: 168, predicted: 165 },
  { date: 'Apr 18', actual: 190, predicted: 188 },
  { date: 'Apr 19', actual: 210, predicted: 205 },
  { date: 'Apr 20', actual: 198, predicted: 195 },
  { date: 'Apr 21', actual: 215, predicted: null },
  { date: 'Apr 22', actual: null, predicted: 230 },
  { date: 'Apr 23', actual: null, predicted: 245 },
];

const staffingData = [
  { time: '8-10am', current: 3, recommended: 4 },
  { time: '10-12pm', current: 4, recommended: 5 },
  { time: '12-2pm', current: 6, recommended: 8 },
  { time: '2-4pm', current: 5, recommended: 5 },
  { time: '4-6pm', current: 4, recommended: 6 },
  { time: '6-8pm', current: 5, recommended: 7 },
];

const lowStockItems = [
  { item: 'Fresh Tomatoes', current: 15, threshold: 50, status: 'critical' },
  { item: 'Mozzarella Cheese', current: 8, threshold: 20, status: 'critical' },
  { item: 'Lettuce', current: 25, threshold: 40, status: 'warning' },
  { item: 'Chicken Breast', current: 30, threshold: 50, status: 'warning' },
];

const expiryItems = [
  { item: 'Milk (2L)', expiry: '2 days', quantity: 12 },
  { item: 'Ground Beef', expiry: '3 days', quantity: 8 },
  { item: 'Fresh Basil', expiry: '1 day', quantity: 5 },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Real-time insights and AI-powered recommendations for your business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Today's Orders"
          value={215}
          icon={ShoppingCart}
          trend={{ value: '+8.5% from yesterday', positive: true }}
        />
        <KPICard
          title="Predicted Tomorrow"
          value={230}
          icon={TrendingUp}
          description="Expected orders for Apr 22"
        />
        <KPICard
          title="Staff Required"
          value="8 people"
          icon={Users}
          description="Next peak: 12-2pm"
        />
        <KPICard
          title="Low Stock Alerts"
          value={4}
          icon={AlertTriangle}
          trend={{ value: '2 critical items', positive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Orders Trend (Actual vs Predicted)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ordersData}>
                <CartesianGrid key="grid-orders" strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  key="xaxis-orders"
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis key="yaxis-orders" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  key="tooltip-orders"
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend key="legend-orders" />
                <Line
                  key="actual-orders"
                  type="monotone"
                  dataKey="actual"
                  stroke="#010507"
                  strokeWidth={2}
                  name="Actual Orders"
                  dot={{ fill: '#010507' }}
                />
                <Line
                  key="predicted-orders"
                  type="monotone"
                  dataKey="predicted"
                  stroke="#BEC2FF"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted Orders"
                  dot={{ fill: '#BEC2FF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <AIInsightPanel
          insights={[
            'Tomorrow lunch peak is expected to increase by 15%. Recommend scheduling 2 additional staff members.',
            'Fresh Tomatoes and Mozzarella are running critically low. Suggest immediate restock to avoid menu disruptions.',
            'Weekend demand pattern shows 20% higher orders on Saturdays. Consider early prep on Friday evenings.',
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current vs Recommended Staffing</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={staffingData}>
                <CartesianGrid key="grid-staffing" strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  key="xaxis-staffing"
                  dataKey="time"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis key="yaxis-staffing" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  key="tooltip-staffing"
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend key="legend-staffing" />
                <Bar key="current-staff" dataKey="current" fill="#85E0CE" name="Current Staff" />
                <Bar key="recommended-staff" dataKey="recommended" fill="#FFAC4D" name="AI Recommended" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Low Stock Alerts</span>
                <Badge variant="destructive">{lowStockItems.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.item}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.current} / {item.threshold} units
                      </p>
                    </div>
                    <Badge variant={item.status === 'critical' ? 'destructive' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items Near Expiry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiryItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.item}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} units</p>
                    </div>
                    <Badge variant="outline">{item.expiry}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
