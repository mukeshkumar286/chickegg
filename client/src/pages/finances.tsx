import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertFinancialEntrySchema } from "@shared/schema";
import { format } from "date-fns";

// Extend the schema with additional validation
const financialFormSchema = insertFinancialEntrySchema.extend({
  date: z.coerce.date(),
  amount: z.coerce.number().positive("Amount must be positive"),
});

const Finances = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof financialFormSchema>>({
    resolver: zodResolver(financialFormSchema),
    defaultValues: {
      date: new Date(),
      amount: 0,
      type: "income",
      category: "",
      description: "",
    },
  });
  
  const { data: financialEntries, isLoading: isLoadingEntries } = useQuery({
    queryKey: ['/api/financials'],
  });
  
  const { data: financialSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['/api/financials/summary'],
  });
  
  const createEntryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof financialFormSchema>) => {
      const res = await apiRequest('POST', '/api/financials', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry created",
        description: "Financial entry has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/financials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financials/summary'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create financial entry.",
        variant: "destructive",
      });
    }
  });
  
  const updateEntryMutation = useMutation({
    mutationFn: async (data: z.infer<typeof financialFormSchema> & { id: number }) => {
      const { id, ...updateData } = data;
      const res = await apiRequest('PATCH', `/api/financials/${id}`, updateData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry updated",
        description: "Financial entry has been updated successfully.",
      });
      setIsDialogOpen(false);
      setIsEditMode(false);
      setCurrentEntry(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/financials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financials/summary'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update financial entry.",
        variant: "destructive",
      });
    }
  });
  
  const handleEdit = (entry: any) => {
    setCurrentEntry(entry);
    setIsEditMode(true);
    
    // Convert date string to Date object
    const entryDate = new Date(entry.date);
    
    form.reset({
      date: entryDate,
      amount: entry.amount,
      type: entry.type,
      category: entry.category,
      description: entry.description || "",
    });
    
    setIsDialogOpen(true);
  };
  
  const onSubmit = (data: z.infer<typeof financialFormSchema>) => {
    if (isEditMode && currentEntry) {
      updateEntryMutation.mutate({
        ...data,
        id: currentEntry.id
      });
    } else {
      createEntryMutation.mutate(data);
    }
  };
  
  // Filter entries based on current tab
  const filteredEntries = activeTab === "overview" 
    ? financialEntries 
    : financialEntries?.filter((entry: any) => entry.type === activeTab.replace('-', '_'));
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-success';
      case 'expense': return 'text-danger';
      case 'investment': return 'text-blue-600';
      case 'capital': return 'text-primary-600';
      default: return 'text-neutral-700';
    }
  };
  
  const getAmountDisplay = (amount: number, type: string) => {
    return type === 'expense' 
      ? `-₹${amount.toLocaleString()}`
      : `₹${amount.toLocaleString()}`;
  };
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Financial Management</h2>
          <p className="text-neutral-600">Track and manage your farm finances</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="finances-add-btn bg-primary-600 hover:bg-primary-700"
              onClick={() => {
                setIsEditMode(false);
                setCurrentEntry(null);
                form.reset({
                  date: new Date(),
                  amount: 0,
                  type: "income",
                  category: "",
                  description: "",
                });
              }}
            >
              <i className="ri-add-line mr-1"></i>
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Financial Entry" : "Add Financial Entry"}</DialogTitle>
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
                            onChange={(e) => {
                              // Explicitly handle the change and update the field value
                              const value = e.target.value ? new Date(e.target.value) : new Date();
                              field.onChange(value);
                            }}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : ''}
                            name={field.name}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (₹)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="investment">Investment</SelectItem>
                            <SelectItem value="capital">Capital</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Feed, Equipment" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter a description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isEditMode ? updateEntryMutation.isPending : createEntryMutation.isPending}
                  >
                    {isEditMode 
                      ? (updateEntryMutation.isPending ? "Updating..." : "Update Entry") 
                      : (createEntryMutation.isPending ? "Saving..." : "Save Entry")
                    }
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Financial Summary */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Capital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingSummary ? "Loading..." : `₹${financialSummary?.totalCapital.toLocaleString() || "0"}`}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Investments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoadingSummary ? "Loading..." : `₹${financialSummary?.totalInvestments.toLocaleString() || "0"}`}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {isLoadingSummary ? "Loading..." : `₹${financialSummary?.totalIncome.toLocaleString() || "0"}`}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">
              {isLoadingSummary ? "Loading..." : `₹${financialSummary?.totalExpenses.toLocaleString() || "0"}`}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Financial Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">All Entries</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expense">Expenses</TabsTrigger>
              <TabsTrigger value="investment">Investments</TabsTrigger>
              <TabsTrigger value="capital">Capital</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              {isLoadingEntries ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p>Loading financial data...</p>
                </div>
              ) : filteredEntries && filteredEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Amount</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEntries.map((entry: any) => (
                        <tr key={entry.id} className="border-b hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {format(new Date(entry.date), 'MMM d, yyyy')}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700 capitalize">
                            {entry.category.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {entry.description || '-'}
                          </td>
                          <td className={`px-4 py-3 text-sm text-right font-medium ${getTypeColor(entry.type)}`}>
                            {getAmountDisplay(entry.amount, entry.type)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEdit(entry)}
                              className="text-neutral-500 hover:text-neutral-800"
                            >
                              <i className="ri-pencil-line text-lg"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <i className="ri-currency-fill text-4xl text-neutral-300 mb-2"></i>
                  <p className="text-neutral-500">No financial entries found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Finances;
