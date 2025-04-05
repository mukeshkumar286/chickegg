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
import { insertInventoryItemSchema } from "@shared/schema";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";

// Extend schema with additional validation
const inventoryFormSchema = insertInventoryItemSchema.extend({
  quantity: z.coerce.number().min(0, "Quantity must be non-negative"),
  reorderLevel: z.coerce.number().min(0, "Reorder level must be non-negative").optional(),
});

// Schema for quantity adjustment
const adjustQuantitySchema = z.object({
  adjustment: z.coerce.number().optional(),
  notes: z.string().optional(),
});

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof inventoryFormSchema>>({
    resolver: zodResolver(inventoryFormSchema),
    defaultValues: {
      name: "",
      category: "",
      quantity: 0,
      unit: "",
      reorderLevel: 0,
      notes: "",
    },
  });
  
  const adjustForm = useForm<z.infer<typeof adjustQuantitySchema>>({
    resolver: zodResolver(adjustQuantitySchema),
    defaultValues: {
      adjustment: 0,
      notes: "",
    },
  });
  
  const { data: inventoryItems, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['/api/inventory'],
  });
  
  const createItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof inventoryFormSchema>) => {
      const res = await apiRequest('POST', '/api/inventory', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Item created",
        description: "Inventory item has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create inventory item.",
        variant: "destructive",
      });
    }
  });
  
  const adjustQuantityMutation = useMutation({
    mutationFn: async ({ id, adjustment }: { id: number; adjustment: number }) => {
      const res = await apiRequest('POST', `/api/inventory/${id}/adjust`, { adjustment });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quantity adjusted",
        description: "Inventory quantity has been updated successfully.",
      });
      setIsAdjustDialogOpen(false);
      adjustForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      setSelectedItem(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to adjust inventory quantity.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: z.infer<typeof inventoryFormSchema>) => {
    createItemMutation.mutate(data);
  };
  
  const onAdjustQuantity = (data: z.infer<typeof adjustQuantitySchema>) => {
    if (selectedItem && data.adjustment !== undefined) {
      adjustQuantityMutation.mutate({ 
        id: selectedItem.id, 
        adjustment: data.adjustment 
      });
    }
  };
  
  const openAdjustDialog = (item: any) => {
    setSelectedItem(item);
    setIsAdjustDialogOpen(true);
    adjustForm.reset({
      adjustment: 0,
      notes: "",
    });
  };
  
  // Filter items based on current tab
  const filteredItems = activeTab === "all"
    ? inventoryItems
    : activeTab === "low"
    ? inventoryItems?.filter((item: any) => 
        item.reorderLevel !== undefined && item.quantity <= item.reorderLevel
      )
    : inventoryItems?.filter((item: any) => item.category === activeTab);
  
  // Get inventory categories for tabs
  const getCategories = () => {
    if (!inventoryItems) return [];
    const categoriesSet = new Set(inventoryItems.map((item: any) => item.category));
    return Array.from(categoriesSet);
  };
  
  const categories = getCategories();
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Inventory Management</h2>
          <p className="text-neutral-600">Manage farm supplies and equipment</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary-600 hover:bg-primary-700">
              <i className="ri-add-line mr-1"></i>
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Layer Feed" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="feed">Feed</SelectItem>
                            <SelectItem value="feed_supplement">Feed Supplement</SelectItem>
                            <SelectItem value="medicine">Medicine</SelectItem>
                            <SelectItem value="packaging">Packaging</SelectItem>
                            <SelectItem value="equipment">Equipment</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            <SelectItem value="g">Grams (g)</SelectItem>
                            <SelectItem value="l">Liters (l)</SelectItem>
                            <SelectItem value="ml">Milliliters (ml)</SelectItem>
                            <SelectItem value="pieces">Pieces</SelectItem>
                            <SelectItem value="bags">Bags</SelectItem>
                            <SelectItem value="boxes">Boxes</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reorderLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reorder Level</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional details about this item" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createItemMutation.isPending}>
                    {createItemMutation.isPending ? "Saving..." : "Save Item"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Adjust Inventory Quantity</DialogTitle>
            </DialogHeader>
            {selectedItem && (
              <div className="mb-4">
                <p className="text-sm font-medium">{selectedItem.name}</p>
                <p className="text-sm text-neutral-500">
                  Current quantity: {selectedItem.quantity} {selectedItem.unit}
                </p>
              </div>
            )}
            <Form {...adjustForm}>
              <form onSubmit={adjustForm.handleSubmit(onAdjustQuantity)} className="space-y-4">
                <FormField
                  control={adjustForm.control}
                  name="adjustment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjustment</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01" 
                          placeholder="Enter positive or negative value"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-neutral-500 mt-1">
                        Use positive values to add, negative values to deduct
                      </p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={adjustForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Reason for adjustment" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={adjustQuantityMutation.isPending}>
                    {adjustQuantityMutation.isPending ? "Updating..." : "Update Quantity"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Low Stock Alert */}
      {!isLoadingInventory && inventoryItems && inventoryItems.some((item: any) => 
        item.reorderLevel !== undefined && item.quantity <= item.reorderLevel
      ) && (
        <div className="mb-6 p-4 border border-amber-200 bg-amber-50 rounded-md flex items-start">
          <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5 mr-2" />
          <div>
            <h3 className="font-medium text-amber-800">Low Stock Alert</h3>
            <p className="text-sm text-amber-700">
              Some items are at or below their reorder levels. Please check the "Low Stock" tab.
            </p>
          </div>
        </div>
      )}
      
      {/* Inventory Items */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="low">Low Stock</TabsTrigger>
              {categories.map((category: string) => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category.replace('_', ' ')}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              {isLoadingInventory ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p>Loading inventory items...</p>
                </div>
              ) : filteredItems && filteredItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Item</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Category</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Quantity</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Reorder Level</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-600">Last Updated</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-neutral-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item: any) => (
                        <tr key={item.id} className="border-b hover:bg-neutral-50">
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700 capitalize">
                            {item.category.replace('_', ' ')}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            <span className={
                              item.reorderLevel !== undefined && item.quantity <= item.reorderLevel
                                ? "text-amber-600"
                                : "text-neutral-700"
                            }>
                              {item.quantity} {item.unit}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-neutral-600">
                            {item.reorderLevel || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-600">
                            {format(new Date(item.lastUpdated), 'MMM d, yyyy')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-neutral-700"
                              onClick={() => openAdjustDialog(item)}
                            >
                              <i className="ri-edit-line mr-1"></i>
                              Adjust
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <i className="ri-store-2-line text-4xl text-neutral-300 mb-2"></i>
                  <p className="text-neutral-500">No inventory items found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Add First Item
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
