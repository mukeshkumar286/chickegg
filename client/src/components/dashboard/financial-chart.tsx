import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { format } from "date-fns";

const FinancialChart = () => {
  const [timeRange, setTimeRange] = useState("30");
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/financials'],
    select: (data) => {
      // Process and transform the data for the chart
      const sortedData = [...data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Group by day and calculate cumulative totals
      const aggregatedData = [];
      const dateMap = new Map();
      
      sortedData.forEach(entry => {
        const dateStr = format(new Date(entry.date), 'MMM dd');
        
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, {
            date: dateStr,
            income: 0,
            expenses: 0,
            profit: 0
          });
        }
        
        const record = dateMap.get(dateStr);
        
        if (entry.type === 'income') {
          record.income += entry.amount;
          record.profit += entry.amount;
        } else if (entry.type === 'expense') {
          record.expenses += entry.amount;
          record.profit -= entry.amount;
        }
      });
      
      dateMap.forEach(value => aggregatedData.push(value));
      return aggregatedData;
    }
  });
  
  return (
    <Card className="p-6 border border-neutral-100 shadow-sm col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-neutral-800">Financial Overview</h3>
        <div className="flex items-center">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] h-9 text-sm">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 12 months</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="relative h-72">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="w-full h-full bg-neutral-50 rounded border border-dashed border-neutral-200 flex items-center justify-center">
            <div className="text-center">
              <i className="ri-bar-chart-grouped-line text-4xl text-neutral-300 mb-2"></i>
              <p className="text-neutral-400 text-sm">No financial data available for this period</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="income" 
                name="Revenue" 
                stackId="1" 
                stroke="#2E7D32" 
                fill="#D0EED1" 
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                name="Expenses" 
                stackId="2" 
                stroke="#D32F2F" 
                fill="#FFCDD2" 
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                name="Profit" 
                stackId="3" 
                stroke="#1976D2" 
                fill="#BBDEFB" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center">
          <p className="text-sm text-neutral-500">Revenue</p>
          <p className="text-lg font-semibold text-neutral-800">$28,429</p>
          <div className="text-xs text-green-600">+12.5%</div>
        </div>
        <div className="text-center">
          <p className="text-sm text-neutral-500">Expenses</p>
          <p className="text-lg font-semibold text-neutral-800">$16,753</p>
          <div className="text-xs text-red-600">+4.3%</div>
        </div>
        <div className="text-center">
          <p className="text-sm text-neutral-500">Profit</p>
          <p className="text-lg font-semibold text-neutral-800">$11,676</p>
          <div className="text-xs text-green-600">+18.2%</div>
        </div>
      </div>
    </Card>
  );
};

export default FinancialChart;
