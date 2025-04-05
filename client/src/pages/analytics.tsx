import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths } from "date-fns";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = [
  "#2E7D32", // Primary
  "#FFA000", // Secondary
  "#1976D2", // Info
  "#D32F2F", // Danger
  "#9C27B0", // Purple
  "#FF9800", // Orange
  "#607D8B"  // Blue Gray
];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("90");
  const [activeTab, setActiveTab] = useState("production");
  
  // Financial Data
  const { data: financialData, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ['/api/financials'],
  });
  
  // Production Data
  const { data: productionData, isLoading: isLoadingProduction } = useQuery({
    queryKey: ['/api/production'],
  });
  
  // Health Data
  const { data: healthData, isLoading: isLoadingHealth } = useQuery({
    queryKey: ['/api/health'],
  });
  
  // Health Summary
  const { data: healthSummary } = useQuery({
    queryKey: ['/api/health/summary'],
  });
  
  // Production Summary
  const { data: productionSummary } = useQuery({
    queryKey: ['/api/production/summary', { days: parseInt(timeRange) }],
  });
  
  // Financial Summary
  const { data: financialSummary } = useQuery({
    queryKey: ['/api/financials/summary'],
  });

  // Process financial data for charts
  const processFinancialData = () => {
    if (!financialData || financialData.length === 0) return [];
    
    // Filter by time range
    const cutoffDate = subMonths(new Date(), parseInt(timeRange)/30);
    const filteredData = financialData.filter((entry: any) => 
      new Date(entry.date) >= cutoffDate
    );
    
    // Group by month
    const monthlyData: Record<string, any> = {};
    
    filteredData.forEach((entry: any) => {
      const monthStr = format(new Date(entry.date), 'MMM yyyy');
      
      if (!monthlyData[monthStr]) {
        monthlyData[monthStr] = {
          month: monthStr,
          income: 0,
          expenses: 0,
          profit: 0
        };
      }
      
      if (entry.type === 'income') {
        monthlyData[monthStr].income += entry.amount;
        monthlyData[monthStr].profit += entry.amount;
      } else if (entry.type === 'expense') {
        monthlyData[monthStr].expenses += entry.amount;
        monthlyData[monthStr].profit -= entry.amount;
      }
    });
    
    return Object.values(monthlyData);
  };

  // Process production data for charts
  const processProductionData = () => {
    if (!productionData || productionData.length === 0) return [];
    
    // Filter by time range
    const cutoffDate = subMonths(new Date(), parseInt(timeRange)/30);
    const filteredData = productionData.filter((entry: any) => 
      new Date(entry.date) >= cutoffDate
    );
    
    // Group by week
    const weeklyData: Record<string, any> = {};
    
    filteredData.forEach((entry: any) => {
      const weekStr = format(new Date(entry.date), 'MMM d');
      
      if (!weeklyData[weekStr]) {
        weeklyData[weekStr] = {
          week: weekStr,
          eggs: 0,
          gradeA: 0,
          gradeB: 0,
          broken: 0
        };
      }
      
      weeklyData[weekStr].eggs += entry.eggCount;
      weeklyData[weekStr].gradeA += entry.gradeA || 0;
      weeklyData[weekStr].gradeB += entry.gradeB || 0;
      weeklyData[weekStr].broken += entry.broken || 0;
    });
    
    return Object.values(weeklyData);
  };

  // Process health data for charts
  const processHealthData = () => {
    if (!healthData || healthData.length === 0) return [];
    
    // Filter by time range
    const cutoffDate = subMonths(new Date(), parseInt(timeRange)/30);
    const filteredData = healthData.filter((entry: any) => 
      new Date(entry.date) >= cutoffDate
    );
    
    // Group by month
    const monthlyData: Record<string, any> = {};
    
    filteredData.forEach((entry: any) => {
      const monthStr = format(new Date(entry.date), 'MMM yyyy');
      
      if (!monthlyData[monthStr]) {
        monthlyData[monthStr] = {
          month: monthStr,
          mortality: 0,
          count: 0
        };
      }
      
      monthlyData[monthStr].mortality += entry.mortalityCount || 0;
      monthlyData[monthStr].count += 1;
    });
    
    return Object.values(monthlyData);
  };
  
  // Get expense breakdown for pie chart
  const getExpenseBreakdown = () => {
    if (!financialSummary || !financialSummary.expensesByCategory) return [];
    
    return Object.entries(financialSummary.expensesByCategory).map(([name, amount], index) => ({
      name: name.replace('_', ' '),
      value: amount as number,
      color: COLORS[index % COLORS.length]
    }));
  };
  
  const financialChartData = processFinancialData();
  const productionChartData = processProductionData();
  const healthChartData = processHealthData();
  const expenseBreakdownData = getExpenseBreakdown();
  
  // Quality distribution data for pie chart
  const qualityDistribution = productionSummary ? [
    { name: "Grade A", value: productionSummary.gradeAPercentage || 0, color: COLORS[0] },
    { name: "Grade B", value: productionSummary.gradeBPercentage || 0, color: COLORS[1] },
    { name: "Broken", value: productionSummary.brokenPercentage || 0, color: COLORS[2] }
  ] : [];
  
  // Common symptoms for bar chart
  const commonSymptoms = healthSummary && healthSummary.commonSymptoms ? 
    healthSummary.commonSymptoms.map((symptom: string, index: number) => ({
      name: symptom.replace('_', ' '),
      value: (healthSummary.commonSymptoms.length - index) * 10, // Mock value based on position
      color: COLORS[index % COLORS.length]
    })) : [];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Analytics</h2>
          <p className="text-neutral-600">Farm performance insights and analysis</p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          className={`px-4 py-2 rounded-md text-sm ${activeTab === 'production' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`} 
          onClick={() => setActiveTab('production')}
        >
          Production
        </button>
        <button 
          className={`px-4 py-2 rounded-md text-sm ${activeTab === 'financial' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`} 
          onClick={() => setActiveTab('financial')}
        >
          Financial
        </button>
        <button 
          className={`px-4 py-2 rounded-md text-sm ${activeTab === 'health' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`} 
          onClick={() => setActiveTab('health')}
        >
          Health
        </button>
      </div>
      
      {/* Production Analytics */}
      {activeTab === "production" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Egg Production Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoadingProduction ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                    </div>
                  ) : productionChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={productionChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="eggs"
                          name="Total Eggs"
                          stroke="#2E7D32"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                        <Line type="monotone" dataKey="gradeA" name="Grade A" stroke="#FFA000" />
                        <Line type="monotone" dataKey="gradeB" name="Grade B" stroke="#1976D2" />
                        <Line type="monotone" dataKey="broken" name="Broken" stroke="#D32F2F" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <i className="ri-bar-chart-grouped-line text-4xl text-neutral-300 mb-2"></i>
                        <p className="text-neutral-400">No production data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Egg Quality Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoadingProduction ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                    </div>
                  ) : qualityDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={qualityDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {qualityDistribution.map((entry: { color: string }, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => `${value}%`}
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <i className="ri-pie-chart-2-line text-4xl text-neutral-300 mb-2"></i>
                        <p className="text-neutral-400">No quality data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Production Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-neutral-500 text-sm mb-1">Total Eggs</p>
                  <p className="text-2xl font-bold">{productionSummary?.totalEggs || 0}</p>
                  <p className="text-xs text-neutral-400">In selected period</p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-neutral-500 text-sm mb-1">Daily Average</p>
                  <p className="text-2xl font-bold">{productionSummary?.dailyAverage || 0}</p>
                  <p className="text-xs text-neutral-400">Eggs per day</p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-neutral-500 text-sm mb-1">Grade A Rate</p>
                  <p className="text-2xl font-bold text-green-600">{productionSummary?.gradeAPercentage || 0}%</p>
                  <p className="text-xs text-neutral-400">Quality percentage</p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-neutral-500 text-sm mb-1">Loss Rate</p>
                  <p className="text-2xl font-bold text-red-600">{productionSummary?.brokenPercentage || 0}%</p>
                  <p className="text-xs text-neutral-400">Broken eggs percentage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Financial Analytics */}
      {activeTab === "financial" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Financial Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoadingFinancial ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                    </div>
                  ) : financialChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={financialChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => `$${value}`}
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#2E7D32" />
                        <Bar dataKey="expenses" name="Expenses" fill="#D32F2F" />
                        <Bar dataKey="profit" name="Profit" fill="#1976D2" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <i className="ri-bar-chart-grouped-line text-4xl text-neutral-300 mb-2"></i>
                        <p className="text-neutral-400">No financial data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoadingFinancial ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                    </div>
                  ) : expenseBreakdownData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseBreakdownData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expenseBreakdownData.map((entry: { color: string }, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => `$${value}`}
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <i className="ri-pie-chart-2-line text-4xl text-neutral-300 mb-2"></i>
                        <p className="text-neutral-400">No expense data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-neutral-500 text-sm mb-1">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">₹{financialSummary?.totalIncome?.toLocaleString() || 0}</p>
                  <p className="text-xs text-neutral-400">Revenue from all sources</p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-neutral-500 text-sm mb-1">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">₹{financialSummary?.totalExpenses?.toLocaleString() || 0}</p>
                  <p className="text-xs text-neutral-400">All operational costs</p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-neutral-500 text-sm mb-1">Net Profit</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{((financialSummary?.totalIncome || 0) - (financialSummary?.totalExpenses || 0)).toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-400">Income minus expenses</p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-neutral-500 text-sm mb-1">Total Capital</p>
                  <p className="text-2xl font-bold">₹{financialSummary?.totalCapital?.toLocaleString() || 0}</p>
                  <p className="text-xs text-neutral-400">Farm investment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Health Analytics */}
      {activeTab === "health" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Mortality Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoadingHealth ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                    </div>
                  ) : healthChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={healthChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="mortality"
                          name="Mortality"
                          stroke="#D32F2F"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <i className="ri-line-chart-line text-4xl text-neutral-300 mb-2"></i>
                        <p className="text-neutral-400">No health data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Common Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoadingHealth ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                    </div>
                  ) : commonSymptoms && commonSymptoms.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={commonSymptoms}
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb'
                          }}
                        />
                        <Bar dataKey="value" name="Occurrence">
                          {commonSymptoms.map((entry: { color: string }, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <i className="ri-bar-chart-horizontal-line text-4xl text-neutral-300 mb-2"></i>
                        <p className="text-neutral-400">No symptom data available</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Health Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-neutral-500 text-sm mb-1">Healthy Rate</p>
                  <p className="text-2xl font-bold text-green-600">{healthSummary?.healthyPercentage || 0}%</p>
                  <p className="text-xs text-neutral-400">Percentage of healthy chickens</p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-neutral-500 text-sm mb-1">Total Mortality</p>
                  <p className="text-2xl font-bold text-red-600">{healthSummary?.totalMortality || 0}</p>
                  <p className="text-xs text-neutral-400">Total losses from health issues</p>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-neutral-500 text-sm mb-1">Common Issues</p>
                  <div className="mt-2">
                    {healthSummary && healthSummary.commonSymptoms && healthSummary.commonSymptoms.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {healthSummary.commonSymptoms.slice(0, 3).map((symptom: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs capitalize">
                            {symptom.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400">No common issues found</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Analytics;