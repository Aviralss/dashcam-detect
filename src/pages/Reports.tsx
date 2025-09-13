import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Download, Filter, Search, MapPin, Calendar, AlertCircle } from "lucide-react";

const reportsData = [
  {
    id: "RPT001",
    location: "Main Street, Downtown",
    severity: "high",
    timestamp: "2024-01-15 14:30",
    status: "reported",
    coordinates: "28.6129, 77.2295",
    vehicle: "VH001"
  },
  {
    id: "RPT002", 
    location: "Oak Avenue, Midtown",
    severity: "medium",
    timestamp: "2024-01-15 13:45",
    status: "in-progress",
    coordinates: "28.6139, 77.2085",
    vehicle: "VH002"
  },
  {
    id: "RPT003",
    location: "Pine Street, Residential", 
    severity: "low",
    timestamp: "2024-01-15 12:20",
    status: "resolved",
    coordinates: "28.6149, 77.2195",
    vehicle: "VH001"
  }
];

const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'high':
      return <Badge className="bg-severity-high text-white">High</Badge>;
    case 'medium':
      return <Badge className="bg-severity-medium text-severity-medium-foreground">Medium</Badge>;
    case 'low':
      return <Badge className="bg-severity-low text-white">Low</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'reported':
      return <Badge variant="outline">Reported</Badge>;
    case 'in-progress':
      return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
    case 'resolved':
      return <Badge className="bg-success text-success-foreground">Resolved</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

const Reports = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Pothole Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive reporting and tracking of detected potholes
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-sm text-muted-foreground">Total Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-severity-high" />
                  <div>
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-muted-foreground">High Severity</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-success" />
                  <div>
                    <p className="text-2xl font-bold">18</p>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-warning" />
                  <div>
                    <p className="text-2xl font-bold">6</p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filter Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search by location or report ID..." 
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="reported">Reported</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply Filters
                </Button>
                
                <Button>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Reports</CardTitle>
              <CardDescription>
                Detailed view of all pothole detection reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportsData.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.location}</p>
                          <p className="text-xs text-muted-foreground">{report.coordinates}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(report.severity)}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-sm">{report.timestamp}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{report.vehicle}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <MapPin className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;