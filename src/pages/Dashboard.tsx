import Navigation from "@/components/Navigation";
import PotholeMap from "@/components/PotholeMap";
import PotholeSidebar from "@/components/PotholeSidebar";
import DashboardStats from "@/components/DashboardStats";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex flex-col">
        {/* Stats Section */}
        <div className="p-6 pb-0">
          <DashboardStats />
        </div>

        <div className="flex-1 flex">
          {/* Main Map Area */}
          <div className="flex-1 p-6">
            <div className="h-full rounded-lg overflow-hidden border border-border shadow-lg">
              <PotholeMap />
            </div>
          </div>
          
          {/* Sidebar */}
          <PotholeSidebar />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;