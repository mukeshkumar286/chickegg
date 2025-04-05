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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertMaintenanceTaskSchema } from "@shared/schema";
import { format, addDays, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

// Extend schema with additional validation
const taskFormSchema = insertMaintenanceTaskSchema.extend({
  dueDate: z.date().optional(),
});

const MaintenanceTasks = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: addDays(startOfToday(), 1),
      completed: false,
      category: "",
      priority: "medium",
    },
  });
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks', { completed: activeTab === "completed" }],
  });
  
  const createTaskMutation = useMutation({
    mutationFn: async (data: z.infer<typeof taskFormSchema>) => {
      const res = await apiRequest('POST', '/api/tasks', data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Task created",
        description: "Maintenance task has been created successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create maintenance task.",
        variant: "destructive",
      });
    }
  });
  
  const toggleTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/tasks/${id}/toggle`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task status.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: z.infer<typeof taskFormSchema>) => {
    createTaskMutation.mutate(data);
  };
  
  const handleToggleTask = (id: number) => {
    toggleTaskMutation.mutate(id);
  };
  
  const getCategoryBadgeClasses = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cleaning':
        return 'bg-primary-100 text-primary-800';
      case 'health':
        return 'bg-red-100 text-red-800';
      case 'inventory':
        return 'bg-amber-100 text-amber-800';
      case 'finance':
        return 'bg-blue-100 text-blue-800';
      case 'repair':
        return 'bg-purple-100 text-purple-800';
      case 'routine':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityBadgeClasses = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDueDate = (date: Date) => {
    const taskDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (taskDate.toDateString() === today.toDateString()) {
      return `Today at ${format(taskDate, 'h:mm a')}`;
    } else if (taskDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${format(taskDate, 'h:mm a')}`;
    } else {
      return format(taskDate, 'MMM d, yyyy') + ' at ' + format(taskDate, 'h:mm a');
    }
  };
  
  const isDueToday = (date: Date) => {
    const taskDate = new Date(date);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  };
  
  const isOverdue = (date: Date) => {
    const taskDate = new Date(date);
    const today = new Date();
    return taskDate < today && taskDate.toDateString() !== today.toDateString();
  };
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Maintenance Tasks</h2>
          <p className="text-neutral-600">Manage farm maintenance and routine tasks</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="maintenance-add-btn bg-primary-600 hover:bg-primary-700">
              <i className="ri-add-line mr-1"></i>
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Maintenance Task</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Clean coops in Building A" {...field} />
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
                            <SelectItem value="cleaning">Cleaning</SelectItem>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="health">Health</SelectItem>
                            <SelectItem value="inventory">Inventory</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Detailed task description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending ? "Saving..." : "Save Task"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Task Stats */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {isLoading 
                ? "Loading..." 
                : tasks?.filter((task: any) => !task.completed).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Due Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-600">
              {isLoading 
                ? "Loading..." 
                : tasks?.filter((task: any) => 
                    !task.completed && task.dueDate && isDueToday(task.dueDate)
                  ).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading 
                ? "Loading..." 
                : tasks?.filter((task: any) => 
                    !task.completed && task.dueDate && isOverdue(task.dueDate)
                  ).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tasks List */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Tasks</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant={activeTab === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("pending")}
              >
                Pending
              </Button>
              <Button 
                variant={activeTab === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("completed")}
              >
                Completed
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p>Loading tasks...</p>
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task: any) => (
                <div 
                  key={task.id} 
                  className={`flex items-start p-4 border rounded-md ${
                    task.completed 
                      ? 'border-gray-100 bg-gray-50' 
                      : task.dueDate && isOverdue(task.dueDate)
                      ? 'border-red-100 bg-red-50'
                      : task.dueDate && isDueToday(task.dueDate)
                      ? 'border-amber-100 bg-amber-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Checkbox 
                    id={`task-${task.id}`} 
                    className="mt-1"
                    checked={task.completed}
                    onCheckedChange={() => handleToggleTask(task.id)}
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <p className={`text-base font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 sm:mt-0 sm:ml-4 flex flex-wrap gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${getCategoryBadgeClasses(task.category)}`}>
                          {task.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityBadgeClasses(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    {task.dueDate && (
                      <p className={`text-xs mt-2 ${
                        task.completed 
                          ? 'text-gray-400' 
                          : isOverdue(task.dueDate)
                          ? 'text-red-600 font-semibold'
                          : isDueToday(task.dueDate)
                          ? 'text-amber-600 font-semibold'
                          : 'text-gray-500'
                      }`}>
                        <i className={`ri-time-line mr-1 ${
                          isOverdue(task.dueDate) && !task.completed ? 'text-red-600' : ''
                        }`}></i>
                        {isOverdue(task.dueDate) && !task.completed ? 'Overdue: ' : ''}
                        {formatDueDate(task.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <i className="ri-checkbox-circle-line text-4xl text-neutral-300 mb-2"></i>
              <p className="text-neutral-500">
                {activeTab === "pending" 
                  ? "No pending tasks. All caught up!" 
                  : "No completed tasks yet."}
              </p>
              {activeTab === "pending" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Create New Task
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceTasks;