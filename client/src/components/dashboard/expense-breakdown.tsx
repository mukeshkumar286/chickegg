import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from "recharts";

interface ExpenseCategory {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

const COLORS = [
  "#2E7D32", // Primary
  "#FFA000", // Secondary
  "#1976D2", // Info
  "#D32F2F", // Danger
  "#757575"  // Neutral
];

const ExpenseBreakdown = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/financials/summary'],
    select: (data) => {
      if (!data.expensesByCategory) return [];
      
      const totalExpenses = data.totalExpenses || 0;
      
      // Convert expense data to pie chart format
      const categories = Object.entries(data.expensesByCategory).map(([name, amount], index) => {
        const percentage = totalExpenses > 0 ? Math.round((amount as number / totalExpenses) * 100) : 0;
        return {
          name,
          value: amount as number,
          percentage,
          color: COLORS[index % COLORS.length]
        };
      });
      
      // Sort by value in descending order
      return categories.sort((a, b) => b.value - a.value);
    }
  });
  
  return (
    <Card className="p-6 border border-neutral-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-neutral-800">Expense Breakdown</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700">
          <i className="ri-more-2-fill"></i>
        </button>
      </div>
      
      <div className="relative h-48 mb-4">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="w-full h-full bg-neutral-50 rounded border border-dashed border-neutral-200 flex items-center justify-center">
            <div className="text-center">
              <i className="ri-pie-chart-2-line text-4xl text-neutral-300 mb-2"></i>
              <p className="text-neutral-400 text-xs">No expense data available</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={false}
              >
                {data.map((entry: ExpenseCategory, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '0.5rem', 
                  border: '1px solid #e5e7eb',
                  fontSize: '0.875rem'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 animate-pulse">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gray-200 mr-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-8"></div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {data && data.slice(0, 5).map((category: ExpenseCategory, index: number) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-sm text-neutral-700 capitalize">
                  {category.name.replace('_', ' ')}
                </span>
              </div>
              <div className="text-sm font-medium">{category.percentage}%</div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ExpenseBreakdown;
