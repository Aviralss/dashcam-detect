import Navigation from "@/components/Navigation";
import PotholeMap from "@/components/PotholeMap";
import PotholeSidebar from "@/components/PotholeSidebar";
import DashboardStats from "@/components/DashboardStats";
import AnalyticalReports from "@/components/AnalyticalReports";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex flex-col">
        {/* Stats Section */}
        <div className="p-6 pb-0">
          <DashboardStats />
        </div>

        <div className="flex-1 p-4 sm:p-6">
          <Tabs defaultValue="map" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="map">Live Map View</TabsTrigger>
              <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
            </TabsList>
            
            <TabsContent value="map" className="flex-1 flex flex-col lg:flex-row min-h-0 mt-0">
              {/* Main Map Area */}
              <div className="flex-1 min-h-0 pr-0 lg:pr-4">
                <div className="h-full min-h-[400px] lg:min-h-0 rounded-lg overflow-hidden border border-border shadow-lg">
                  <PotholeMap />
                </div>
              </div>
              
              {/* Sidebar */}
              <PotholeSidebar />
            </TabsContent>
            
            <TabsContent value="analytics" className="flex-1 mt-0">
              <AnalyticalReports />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;