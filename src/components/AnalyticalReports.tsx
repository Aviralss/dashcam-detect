import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePotholes } from '@/hooks/usePotholes';
import { useVehicles } from '@/hooks/useVehicles';
import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

const SEVERITY_COLORS = {
  high: '#dc2626',
  medium: '#f59e0b',
  low: '#16a34a'
};

const STATUS_COLORS = {
  pending: '#6b7280',
  verified: '#3b82f6',
  repaired: '#10b981'
};

const AnalyticalReports = () => {
  const { potholes } = usePotholes();
  const { vehicles } = useVehicles();

  const analyticsData = useMemo(() => {
    // Severity distribution
    const severityData = Object.entries(
      potholes.reduce((acc, pothole) => {
        acc[pothole.severity] = (acc[pothole.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

    // Status distribution
    const statusData = Object.entries(
      potholes.reduce((acc, pothole) => {
        acc[pothole.status] = (acc[pothole.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

    // Monthly trends (last 6 months)
    const monthlyData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthPotholes = potholes.filter(p => {
        const potholeDate = new Date(p.created_at);
        return potholeDate.getMonth() === date.getMonth() && 
               potholeDate.getFullYear() === date.getFullYear();
      });
      
      monthlyData.push({
        month: monthName,
        total: monthPotholes.length,
        high: monthPotholes.filter(p => p.severity === 'high').length,
        medium: monthPotholes.filter(p => p.severity === 'medium').length,
        low: monthPotholes.filter(p => p.severity === 'low').length,
        repaired: monthPotholes.filter(p => p.status === 'repaired').length
      });
    }

    // Daily detections (last 7 days)
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayPotholes = potholes.filter(p => {
        const potholeDate = new Date(p.created_at);
        return potholeDate.toDateString() === date.toDateString();
      });
      
      dailyData.push({
        day: dayName,
        detections: dayPotholes.length,
        high: dayPotholes.filter(p => p.severity === 'high').length,
        medium: dayPotholes.filter(p => p.severity === 'medium').length,
        low: dayPotholes.filter(p => p.severity === 'low').length
      });
    }

    // Vehicle performance
    const vehicleData = vehicles.map(vehicle => {
      const vehiclePotholes = potholes.filter(p => p.vehicle_id === vehicle.vehicle_id);
      return {
        name: vehicle.name,
        detections: vehiclePotholes.length,
        efficiency: vehiclePotholes.length > 0 ? (vehiclePotholes.filter(p => p.status === 'verified').length / vehiclePotholes.length * 100).toFixed(1) : 0
      };
    });

    return {
      severityData,
      statusData,
      monthlyData,
      dailyData,
      vehicleData
    };
  }, [potholes, vehicles]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Analytical Reports</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Severity Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Severity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.severityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.severityData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={SEVERITY_COLORS[entry.name.toLowerCase() as keyof typeof SEVERITY_COLORS]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.statusData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUS_COLORS[entry.name.toLowerCase() as keyof typeof STATUS_COLORS]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Daily Detections */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Daily Detections (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="detections" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Trends (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="repaired" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Severity Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Severity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="high" stackId="1" stroke="#dc2626" fill="#dc2626" />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                  <Area type="monotone" dataKey="low" stackId="1" stroke="#16a34a" fill="#16a34a" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          {/* Daily Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Detection Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="high" stackId="a" fill="#dc2626" />
                  <Bar dataKey="medium" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="low" stackId="a" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Vehicle Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Detection Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData.vehicleData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="detections" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Efficiency Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Detection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {analyticsData.dailyData.reduce((sum, day) => sum + day.detections, 0)} / week
                </div>
                <p className="text-xs text-muted-foreground">Average weekly detections</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Verification Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {potholes.length > 0 ? ((potholes.filter(p => p.status === 'verified').length / potholes.length) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Verified detections</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Repair Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {potholes.length > 0 ? ((potholes.filter(p => p.status === 'repaired').length / potholes.length) * 100).toFixed(1) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">Completed repairs</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticalReports;