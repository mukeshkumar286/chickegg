import { useQuery } from "@tanstack/react-query";
import MetricCard from "@/components/dashboard/metric-card";
import FinancialChart from "@/components/dashboard/financial-chart";
import ExpenseBreakdown from "@/components/dashboard/expense-breakdown";
import UpcomingTasks from "@/components/dashboard/upcoming-tasks";
import ProductionMetrics from "@/components/dashboard/production-metrics";
import RecentNotes from "@/components/dashboard/recent-notes";

const Dashboard = () => {
  const { data: financialSummary, isLoading: isLoadingFinancials } = useQuery({
    queryKey: ['/api/financials/summary'],
  });
  
  const { data: productionSummary, isLoading: isLoadingProduction } = useQuery({
    queryKey: ['/api/production/summary'],
  });
  
  const { data: healthSummary, isLoading: isLoadingHealth } = useQuery({
    queryKey: ['/api/health/summary'],
  });
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-800">Dashboard Overview</h2>
        <p className="text-neutral-600">Welcome back! Here's what's happening with your farm today.</p>
      </div>
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Capital"
          value={isLoadingFinancials ? "Loading..." : `$${financialSummary?.totalCapital?.toLocaleString() || "124,500"}`}
          icon="ri-funds-line"
          iconBgClass="bg-primary-50"
          iconClass="text-primary-600"
          trend={{
            value: 8.2,
            label: "vs last month"
          }}
        />
        
        <MetricCard
          title="Today's Production"
          value={isLoadingProduction ? "Loading..." : `${productionSummary?.dailyAverage || 743} eggs`}
          icon="ri-egg-line"
          iconBgClass="bg-secondary-50"
          iconClass="text-secondary-600"
          trend={{
            value: -2.1,
            label: "vs yesterday"
          }}
        />
        
        <MetricCard
          title="Chicken Health"
          value={isLoadingHealth ? "Loading..." : `${healthSummary?.healthyPercentage || 98}% Healthy`}
          icon="ri-heart-pulse-line"
          iconBgClass="bg-success bg-opacity-10"
          iconClass="text-success"
          trend={{
            value: 1.5,
            label: "vs last week"
          }}
        />
        
        <MetricCard
          title="Monthly Expenses"
          value={isLoadingFinancials ? "Loading..." : `$${Math.round(financialSummary?.totalExpenses || 6284).toLocaleString()}`}
          icon="ri-money-dollar-circle-line"
          iconBgClass="bg-danger bg-opacity-10"
          iconClass="text-danger"
          trend={{
            value: -3.4,
            label: "vs last month"
          }}
        />
      </div>
      
      {/* Charts and Data Sections */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
        <FinancialChart />
        <ExpenseBreakdown />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <UpcomingTasks />
        <ProductionMetrics />
        <RecentNotes />
      </div>
    </div>
  );
};

export default Dashboard;
