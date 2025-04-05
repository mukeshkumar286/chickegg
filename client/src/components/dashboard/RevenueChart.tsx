import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts";

type FinancialChartData = {
  name: string;
  revenue: number;
  expenses: number;
};

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-[#15803D]">
          <span className="font-semibold">Revenue:</span> ${payload[0]?.value?.toFixed(2)}
        </p>
        <p className="text-sm text-[#EF4444]">
          <span className="font-semibold">Expenses:</span> ${payload[1]?.value?.toFixed(2)}
        </p>
      </div>
    );
  }

  return null;
};

const RevenueChart = () => {
  const { data, isLoading, error } = useQuery<Record<string, { revenue: number, expenses: number }>>({
    queryKey: ["/api/dashboard/financial-charts"],
  });

  const chartData: FinancialChartData[] = data 
    ? Object.entries(data).map(([month, values]) => ({
        name: month,
        revenue: Number(values.revenue.toFixed(2)),
        expenses: Number(values.expenses.toFixed(2))
      }))
    : [];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Revenue vs Expenses</h3>
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
          <h3 className="text-lg font-medium leading-6 text-gray-900">Revenue vs Expenses</h3>
          <div className="mt-4 h-[300px] flex items-center justify-center">
            <p className="text-red-500">Error loading chart data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Revenue vs Expenses</h3>
        <div className="mt-2 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="revenue" 
                name="Revenue" 
                fill="#15803D" 
                barSize={20}
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="expenses" 
                name="Expenses" 
                fill="#EF4444" 
                barSize={20}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
