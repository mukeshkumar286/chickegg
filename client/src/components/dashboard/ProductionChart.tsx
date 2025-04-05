import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts";

type ChartBatchData = {
  [batch: string]: number;
};

type ProductionChartData = {
  name: string;
  [batch: string]: number | string;
};

// Colors for different batches
const BATCH_COLORS = [
  "#0F766E", // Primary teal
  "#EA580C", // Orange
  "#8B5CF6", // Purple
  "#10B981", // Green
  "#EC4899", // Pink
];

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={`tooltip-${index}`} className="text-sm" style={{ color: entry.color }}>
            <span className="font-semibold">{entry.name}:</span> {entry.value} eggs
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const ProductionChart = () => {
  const { data, isLoading, error } = useQuery<Record<string, ChartBatchData>>({
    queryKey: ["/api/dashboard/production-charts"],
  });

  const chartData: ProductionChartData[] = [];
  
  if (data) {
    const batches = new Set<string>();
    
    // First identify all unique batches across all weeks
    Object.values(data).forEach(weekData => {
      Object.keys(weekData).forEach(batch => batches.add(batch));
    });
    
    // Then create the formatted chart data
    Object.entries(data).forEach(([week, weekData]) => {
      const entry: ProductionChartData = { name: week };
      
      batches.forEach(batch => {
        entry[batch] = weekData[batch] || 0;
      });
      
      chartData.push(entry);
    });
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Egg Production Metrics</h3>
          <div className="mt-4 h-[300px] flex items-center justify-center">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Egg Production Metrics</h3>
          <div className="mt-4 h-[300px] flex items-center justify-center">
            <p className="text-red-500">Error loading chart data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract unique batch names excluding the 'name' property
  const batches = chartData.length > 0 
    ? Object.keys(chartData[0]).filter(key => key !== 'name')
    : [];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Egg Production Metrics</h3>
        <div className="mt-2 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis 
                label={{ value: 'Eggs per week', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {batches.map((batch, index) => (
                <Line
                  key={batch}
                  type="monotone"
                  dataKey={batch}
                  name={batch}
                  stroke={BATCH_COLORS[index % BATCH_COLORS.length]}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionChart;
