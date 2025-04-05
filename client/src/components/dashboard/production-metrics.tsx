import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

const ProductionMetrics = () => {
  const [timeRange, setTimeRange] = useState("week");
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/production/summary', { days: timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90 }],
    select: (data) => data,
  });
  
  return (
    <Card className="p-6 border border-neutral-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-neutral-800">Production Metrics</h3>
        <div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="text-sm border border-neutral-200 rounded py-1 px-2 h-8 w-[130px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-5">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between mb-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5"></div>
              </div>
            ))}
          </>
        ) : data ? (
          <>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-neutral-700">Egg Production Rate</span>
                <span className="text-sm font-medium text-neutral-700">92%</span>
              </div>
              <Progress value={92} className="h-2.5" />
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-neutral-700">Grade A Quality</span>
                <span className="text-sm font-medium text-neutral-700">{data.gradeAPercentage || 87}%</span>
              </div>
              <Progress value={data.gradeAPercentage || 87} className="h-2.5 bg-neutral-200">
                <div className="h-full bg-amber-500 rounded-full"></div>
              </Progress>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-neutral-700">Feed Conversion</span>
                <span className="text-sm font-medium text-neutral-700">76%</span>
              </div>
              <Progress value={76} className="h-2.5 bg-neutral-200">
                <div className="h-full bg-blue-500 rounded-full"></div>
              </Progress>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-neutral-700">Hen Survivability</span>
                <span className="text-sm font-medium text-neutral-700">98%</span>
              </div>
              <Progress value={98} className="h-2.5 bg-neutral-200">
                <div className="h-full bg-green-500 rounded-full"></div>
              </Progress>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <i className="ri-bar-chart-grouped-line text-3xl text-neutral-300 mb-2"></i>
            <p className="text-neutral-500">No production data available</p>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between text-sm text-neutral-700 mb-2">
          <span>{timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Quarterly'} Production Stats</span>
        </div>
        <div className="bg-neutral-50 p-3 rounded-md">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-neutral-500">Total Eggs</p>
              <p className="text-lg font-medium">{data?.totalEggs || 5284}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Avg. per Hen</p>
              <p className="text-lg font-medium">6.2</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Revenue</p>
              <p className="text-lg font-medium">$1,849</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Cost/Egg</p>
              <p className="text-lg font-medium">$0.18</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductionMetrics;
