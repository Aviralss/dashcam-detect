import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePotholes } from '@/hooks/usePotholes';
import { useVehicles } from '@/hooks/useVehicles';
import { useNotifications } from '@/hooks/useNotifications';
import { AlertTriangle, Car, Bell, CheckCircle } from 'lucide-react';
import { useMemo } from 'react';

const DashboardStats = () => {
  const { potholes } = usePotholes();
  const { activeVehicles } = useVehicles();
  const { unreadCount } = useNotifications();

  const stats = useMemo(() => {
    const severityStats = potholes.reduce((acc, pothole) => {
      acc[pothole.severity] = (acc[pothole.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusStats = potholes.reduce((acc, pothole) => {
      acc[pothole.status] = (acc[pothole.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: potholes.length,
      high: severityStats.high || 0,
      medium: severityStats.medium || 0,
      low: severityStats.low || 0,
      pending: statusStats.pending || 0,
      verified: statusStats.verified || 0,
      repaired: statusStats.repaired || 0
    };
  }, [potholes]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Potholes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Potholes</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="flex gap-1 mt-2">
            <Badge variant="destructive" className="text-xs">
              H: {stats.high}
            </Badge>
            <Badge className="bg-orange-500 text-white text-xs">
              M: {stats.medium}
            </Badge>
            <Badge className="bg-green-500 text-white text-xs">
              L: {stats.low}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Active Vehicles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeVehicles}</div>
          <p className="text-xs text-muted-foreground">
            Vehicles monitoring roads
          </p>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Alerts</CardTitle>
          <Bell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{unreadCount}</div>
          <p className="text-xs text-muted-foreground">
            Unread notifications
          </p>
        </CardContent>
      </Card>

      {/* Repair Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Repairs</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.repaired}</div>
          <div className="flex gap-1 mt-2">
            <Badge variant="outline" className="text-xs">
              Pending: {stats.pending}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Verified: {stats.verified}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;