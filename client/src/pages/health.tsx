import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertHealthRecordSchema, insertChickenBatchSchema } from "@shared/schema";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Common symptoms for multi-select
const symptomOptions = [
  { id: "lethargy", label: "Lethargy" },
  { id: "reduced_appetite", label: "Reduced Appetite" },
  { id: "weight_loss", label: "Weight Loss" },
  { id: "diarrhea", label: "Diarrhea" },
  { id: "coughing", label: "Coughing" },
  { id: "sneezing", label: "Sneezing" },
  { id: "abnormal_droppings", label: "Abnormal Droppings" },
  { id: "decreased_egg_production", label: "Decreased Egg Production" }
];

// Extend schema with additional validation
const healthRecordFormSchema = insertHealthRecordSchema.extend({
  date: z.coerce.date(),
  mortalityCount: z.coerce.number().min(0, "Mortality count must be non-negative").optional(),
  symptoms: z.array(z.string()).optional(),
});

const chickenBatchFormSchema = insertChickenBatchSchema.extend({
  acquisitionDate: z.coerce.date(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

const Health = () => {
  const [activeTab, setActiveTab] = useState("batches");
  const [isHealthDialogOpen, setIsHealthDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const healthForm = useForm<z.infer<typeof healthRecordFormSchema>>({
    resolver: zodResolver(healthRecordFormSchema),
    defaultValues: {
      date: new Date(),
      batchId: "",
      mortalityCount: 0,
      symptoms: [],
      diagnosis: "",
      treatment: "",
      notes: "",
    },
  });
  
  const batchForm = useForm<z.infer<typeof chickenBatchFormSchema>>({
    resolver: zodResolver(chickenBatchFormSchema),
    defaultValues: {
      batchId: "",
      breed: "",
      quantity: 0,
      acquisitionDate: new Date(),
      status: "active",
      notes: "",
    },
  });
  
  const { data: chickenBatches, isLoading: isLoadingBatches } = useQuery({
    queryKey: ['/api/chickens'],
  });
  
  const { data: healthRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ['/api/health'],
  });
  
  const { data: healthSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['/api/health/summary'],
  });
  
  const createHealthRecordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof healthRecordFormSchema>) => {
      const res = await apiRequest('POST', '/api/health', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Record created",
        description: "Health record has been created successfully.",
      });
      setIsHealthDialogOpen(false);
      healthForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/health'] });
      queryClient.invalidateQueries({ queryKey: ['/api/health/summary'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create health record.",
        variant: "destructive",
      });
    }
  });
  
  const createBatchMutation = useMutation({
    mutationFn: async (data: z.infer<typeof chickenBatchFormSchema>) => {
      const res = await apiRequest('POST', '/api/chickens', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Batch created",
        description: "Chicken batch has been created successfully.",
      });
      setIsBatchDialogOpen(false);
      batchForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/chickens'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create chicken batch.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmitHealthRecord = (data: z.infer<typeof healthRecordFormSchema>) => {
    createHealthRecordMutation.mutate(data);
  };
  
  const onSubmitBatch = (data: z.infer<typeof chickenBatchFormSchema>) => {
    createBatchMutation.mutate(data);
  };
  
  // Get active chicken count
  const getActiveChickenCount = () => {
    if (!chickenBatches) return 0;
    return chickenBatches
      .filter((batch: any) => batch.status === "active")
      .reduce((sum: number, batch: any) => sum + batch.quantity, 0);
  };
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Chicken Health</h2>
          <p className="text-neutral-600">Monitor and track chicken health and wellness</p>
        </div>
        
        {activeTab === "records" ? (
          <Dialog open={isHealthDialogOpen} onOpenChange={setIsHealthDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-600 hover:bg-primary-700">
                <i className="ri-add-line mr-1"></i>
                New Health Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Health Record</DialogTitle>
              </DialogHeader>
              <Form {...healthForm}>
                <form onSubmit={healthForm.handleSubmit(onSubmitHealthRecord)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={healthForm.control}
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
                      control={healthForm.control}
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
                                chickenBatches
                                  .filter((batch: any) => batch.status === "active")
                                  .map((batch: any) => (
                                    <SelectItem key={batch.batchId} value={batch.batchId}>
                                      {batch.batchId} - {batch.breed} ({batch.quantity} birds)
                                    </SelectItem>
                                  ))
                              ) : (
                                <SelectItem value="none" disabled>No active batches</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={healthForm.control}
                      name="mortalityCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mortality Count</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={healthForm.control}
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosis</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Respiratory infection" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={healthForm.control}
                    name="symptoms"
                    render={() => (
                      <FormItem>
                        <div className="mb-2">
                          <FormLabel>Symptoms</FormLabel>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {symptomOptions.map((option) => (
                            <FormField
                              key={option.id}
                              control={healthForm.control}
                              name="symptoms"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={option.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(option.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value || [], option.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {option.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={healthForm.control}
                    name="treatment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe any treatments administered"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={healthForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional observations or follow-up plans"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsHealthDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createHealthRecordMutation.isPending}>
                      {createHealthRecordMutation.isPending ? "Saving..." : "Save Record"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary-600 hover:bg-primary-700">
                <i className="ri-add-line mr-1"></i>
                Add Chicken Batch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Chicken Batch</DialogTitle>
              </DialogHeader>
              <Form {...batchForm}>
                <form onSubmit={batchForm.handleSubmit(onSubmitBatch)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={batchForm.control}
                      name="batchId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Batch ID</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., B001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={batchForm.control}
                      name="breed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Breed</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select breed" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Rhode Island Red">Rhode Island Red</SelectItem>
                              <SelectItem value="Leghorn">Leghorn</SelectItem>
                              <SelectItem value="Plymouth Rock">Plymouth Rock</SelectItem>
                              <SelectItem value="Sussex">Sussex</SelectItem>
                              <SelectItem value="Orpington">Orpington</SelectItem>
                              <SelectItem value="Australorp">Australorp</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={batchForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={batchForm.control}
                      name="acquisitionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Acquisition Date</FormLabel>
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
                  </div>
                  
                  <FormField
                    control={batchForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="deceased">Deceased</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={batchForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional information about this batch" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsBatchDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createBatchMutation.isPending}>
                      {createBatchMutation.isPending ? "Saving..." : "Save Batch"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      
      {/* Health Summary */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Active Chickens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingBatches ? "Loading..." : getActiveChickenCount()}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Health Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {isLoadingSummary ? "Loading..." : `${healthSummary?.healthyPercentage || 0}%`}
            </div>
            <Progress 
              value={healthSummary?.healthyPercentage || 0} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Mortality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">
              {isLoadingSummary ? "Loading..." : healthSummary?.totalMortality || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Active Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-600">
              {isLoadingBatches 
                ? "Loading..." 
                : chickenBatches?.filter((batch: any) => batch.status === "active").length || 0}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="batches">Chicken Batches</TabsTrigger>
          <TabsTrigger value="records">Health Records</TabsTrigger>
        </TabsList>
        
        {/* Chicken Batches Tab */}
        <TabsContent value="batches">
          <Card>
            <CardHeader>
              <CardTitle>Chicken Batches</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBatches ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p>Loading chicken batches...</p>
                </div>
              ) : chickenBatches && chickenBatches.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Batch ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Breed</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Quantity</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Acquisition Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chickenBatches.map((batch: any) => (
                        <tr key={batch.id} className="border-b hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm font-medium text-neutral-700">
                            {batch.batchId}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {batch.breed}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-neutral-700">
                            {batch.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              batch.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : batch.status === 'sold'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {batch.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {format(new Date(batch.acquisitionDate), 'MMM d, yyyy')}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {batch.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <i className="ri-open-arm-line text-4xl text-neutral-300 mb-2"></i>
                  <p className="text-neutral-500">No chicken batches found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setIsBatchDialogOpen(true)}
                  >
                    Add First Batch
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Health Records Tab */}
        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Health Records</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRecords ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p>Loading health records...</p>
                </div>
              ) : healthRecords && healthRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Batch</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Symptoms</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Diagnosis</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Mortality</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Treatment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...healthRecords].sort((a, b) => 
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                      ).map((record: any) => (
                        <tr key={record.id} className="border-b hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {format(new Date(record.date), 'MMM d, yyyy')}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-neutral-700">
                            {record.batchId}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {record.symptoms && record.symptoms.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {record.symptoms.map((symptom: string, i: number) => (
                                  <span 
                                    key={i} 
                                    className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 rounded text-xs capitalize"
                                  >
                                    {symptom.replace('_', ' ')}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {record.diagnosis || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-red-600">
                            {record.mortalityCount || 0}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {record.treatment || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <i className="ri-heart-pulse-line text-4xl text-neutral-300 mb-2"></i>
                  <p className="text-neutral-500">No health records found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setIsHealthDialogOpen(true)}
                  >
                    Add First Health Record
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Health;
