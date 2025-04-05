import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductionRecordSchema } from "@shared/schema";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Extend schema with additional validation
const productionFormSchema = insertProductionRecordSchema.extend({
  date: z.coerce.date(),
  eggCount: z.coerce.number().min(0, "Egg count must be non-negative"),
  gradeA: z.coerce.number().min(0, "Grade A count must be non-negative").optional(),
  gradeB: z.coerce.number().min(0, "Grade B count must be non-negative").optional(),
  broken: z.coerce.number().min(0, "Broken count must be non-negative").optional(),
});

const COLORS = ["#2E7D32", "#FFA000", "#D32F2F"];

const Production = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof productionFormSchema>>({
    resolver: zodResolver(productionFormSchema),
    defaultValues: {
      date: new Date(),
      eggCount: 0,
      gradeA: 0,
      gradeB: 0,
      broken: 0,
      notes: "",
    },
  });
  
  const { data: productionRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ['/api/production'],
  });
  
  const { data: productionSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['/api/production/summary'],
  });
  
  const { data: chickenBatches, isLoading: isLoadingBatches } = useQuery({
    queryKey: ['/api/chickens'],
  });
  
  const createRecordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof productionFormSchema>) => {
      const res = await apiRequest('POST', '/api/production', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Record created",
        description: "Production record has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/production'] });
      queryClient.invalidateQueries({ queryKey: ['/api/production/summary'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create production record.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: z.infer<typeof productionFormSchema>) => {
    createRecordMutation.mutate(data);
  };
  
  // Process chart data
  const processChartData = () => {
    if (!productionRecords || productionRecords.length === 0) return [];
    
    // Sort by date
    const sortedRecords = [...productionRecords].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Take the most recent 14 days of data
    const recentRecords = sortedRecords.slice(-14);
    
    return recentRecords.map(record => ({
      date: format(new Date(record.date), 'MMM dd'),
      eggs: record.eggCount,
      gradeA: record.gradeA || 0,
      gradeB: record.gradeB || 0,
      broken: record.broken || 0
    }));
  };
  
  const chartData = processChartData();
  
  // Quality distribution data for pie chart
  const qualityData = productionSummary ? [
    { name: "Grade A", value: productionSummary.gradeAPercentage },
    { name: "Grade B", value: productionSummary.gradeBPercentage },
    { name: "Broken", value: productionSummary.brokenPercentage }
  ] : [];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Egg Production</h2>
          <p className="text-neutral-600">Monitor and record daily egg production</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="production-add-btn bg-primary-600 hover:bg-primary-700">
              <i className="ri-add-line mr-1"></i>
              Record Production
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Production Record</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : ''} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eggCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Eggs</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="gradeA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade A</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gradeB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Grade B</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="broken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Broken</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="batchId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chicken Batch</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select batch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingBatches ? (
                            <SelectItem value="loading" disabled>Loading batches...</SelectItem>
                          ) : chickenBatches && chickenBatches.length > 0 ? (
                            chickenBatches.map((batch: any) => (
                              <SelectItem key={batch.batchId} value={batch.batchId}>
                                {batch.batchId} - {batch.breed} ({batch.quantity} birds)
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No batches available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Any observations about today's production" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createRecordMutation.isPending}>
                    {createRecordMutation.isPending ? "Saving..." : "Save Record"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Production Summary */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? "Loading..." : `${productionSummary?.dailyAverage || "0"} eggs`}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Eggs (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-600">
              {isLoadingSummary ? "Loading..." : `${productionSummary?.totalEggs || "0"} eggs`}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Grade A Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {isLoadingSummary ? "Loading..." : `${productionSummary?.gradeAPercentage || "0"}%`}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Loss Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">
              {isLoadingSummary ? "Loading..." : `${productionSummary?.brokenPercentage || "0"}%`}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Production Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoadingRecords ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                </div>
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" />
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
            <CardTitle>Quality Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isLoadingSummary ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
                </div>
              ) : qualityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={qualityData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {qualityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
      
      {/* Production Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Production Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRecords ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p>Loading production records...</p>
            </div>
          ) : productionRecords && productionRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Batch</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Total Eggs</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Grade A</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Grade B</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Broken</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {[...productionRecords].sort((a, b) => 
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                  ).map((record: any) => (
                    <tr key={record.id} className="border-b hover:bg-neutral-50">
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {format(new Date(record.date), 'MMM d, yyyy')}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {record.batchId || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-neutral-700">
                        {record.eggCount}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-600">
                        {record.gradeA || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-amber-600">
                        {record.gradeB || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-red-600">
                        {record.broken || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {record.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <i className="ri-egg-line text-4xl text-neutral-300 mb-2"></i>
              <p className="text-neutral-500">No production records found</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                Record First Production
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Production;
