import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { MaintenanceTask } from "@shared/schema";

const TaskItem = ({ task }: { task: MaintenanceTask }) => {
  const { toast } = useToast();
  
  const toggleMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('POST', `/api/tasks/${id}/toggle`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update task status.",
        variant: "destructive",
      });
    }
  });
  
  const handleToggle = () => {
    toggleMutation.mutate(task.id);
  };
  
  const getCategoryBadgeClasses = (category: string) => {
    switch (category.toLowerCase()) {
      case 'maintenance':
        return 'bg-primary-100 text-primary-800';
      case 'health':
        return 'bg-red-100 text-red-800';
      case 'inventory':
        return 'bg-amber-100 text-amber-800';
      case 'finance':
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
      return format(taskDate, 'MMM d') + ' at ' + format(taskDate, 'h:mm a');
    }
  };
  
  return (
    <div className={`flex items-start p-3 border border-neutral-100 rounded-md hover:bg-neutral-50 ${task.completed ? 'opacity-60' : ''}`}>
      <Checkbox 
        id={`task-${task.id}`} 
        className="mt-1"
        checked={task.completed}
        onCheckedChange={handleToggle}
      />
      <div className="ml-3">
        <p className="text-sm font-medium text-neutral-800">{task.title}</p>
        {task.dueDate && (
          <p className="text-xs text-neutral-500 mt-1">{formatDueDate(task.dueDate)}</p>
        )}
      </div>
      <div className="ml-auto">
        <span className={`text-xs px-2 py-1 rounded ${getCategoryBadgeClasses(task.category)}`}>
          {task.category}
        </span>
      </div>
    </div>
  );
};

const UpcomingTasks = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
    select: (data) => {
      // Get only upcoming/incomplete tasks and limit to 4
      return data
        .filter((task: MaintenanceTask) => !task.completed)
        .slice(0, 4);
    }
  });
  
  return (
    <Card className="p-6 border border-neutral-100 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-neutral-800">Upcoming Tasks</h3>
        <Link href="/maintenance">
          <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 p-0 h-auto">
            <i className="ri-add-line mr-1"></i> Add
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex p-3 border border-neutral-100 rounded-md">
                <div className="h-4 w-4 bg-gray-200 rounded-sm"></div>
                <div className="ml-3 space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="w-20 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </>
        ) : data && data.length > 0 ? (
          data.map((task: MaintenanceTask) => (
            <TaskItem key={task.id} task={task} />
          ))
        ) : (
          <div className="text-center p-6">
            <i className="ri-checkbox-circle-line text-neutral-300 text-3xl mb-2"></i>
            <p className="text-neutral-500 text-sm">All tasks completed. Nice work!</p>
          </div>
        )}
      </div>
      
      <Link href="/maintenance">
        <Button variant="link" className="w-full mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
          View all tasks
        </Button>
      </Link>
    </Card>
  );
};

export default UpcomingTasks;
