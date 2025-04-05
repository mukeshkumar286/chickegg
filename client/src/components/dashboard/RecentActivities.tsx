import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Tag, Clock } from "lucide-react";
import { ActivityLog } from "@shared/schema";

// Helper function to get appropriate icon and color based on activity type
const getActivityMeta = (type: string) => {
  switch (type) {
    case 'expense':
      return { badge: 'bg-red-100 text-red-800', icon: <Tag size={14} className="flex-shrink-0 mr-1.5 text-gray-400" /> };
    case 'revenue':
      return { badge: 'bg-green-100 text-green-800', icon: <Tag size={14} className="flex-shrink-0 mr-1.5 text-gray-400" /> };
    case 'health_check':
      return { badge: 'bg-green-100 text-green-800', icon: <Tag size={14} className="flex-shrink-0 mr-1.5 text-gray-400" /> };
    case 'egg_production':
      return { badge: 'bg-blue-100 text-blue-800', icon: <Tag size={14} className="flex-shrink-0 mr-1.5 text-gray-400" /> };
    case 'task_completed':
      return { badge: 'bg-purple-100 text-purple-800', icon: <Tag size={14} className="flex-shrink-0 mr-1.5 text-gray-400" /> };
    default:
      return { badge: 'bg-gray-100 text-gray-800', icon: <Tag size={14} className="flex-shrink-0 mr-1.5 text-gray-400" /> };
  }
};

// Helper function to format activity details
const formatActivityDetails = (activity: ActivityLog) => {
  if (!activity.details) return null;
  
  const details = activity.details as Record<string, any>;
  
  switch (activity.activityType) {
    case 'expense':
      return `$${Number(details.amount).toFixed(2)}`;
    case 'revenue':
      return `$${Number(details.amount).toFixed(2)}`;
    case 'health_check':
      return details.batchId ? `Batch #${details.batchId}` : null;
    case 'egg_production':
      return details.quantity ? `${details.quantity} eggs` : null;
    default:
      return null;
  }
};

// Helper function to format activity category
const formatActivityCategory = (activity: ActivityLog) => {
  if (!activity.details) return "General";
  
  const details = activity.details as Record<string, any>;
  
  switch (activity.activityType) {
    case 'expense':
      return details.category || "Expense";
    case 'revenue':
      return details.source || "Revenue";
    case 'health_check':
      return "Health & Wellness";
    case 'egg_production':
      return "Production";
    case 'task_completed':
      return details.category || "Task";
    default:
      return "General";
  }
};

const RecentActivities = () => {
  const { data, isLoading, error } = useQuery<ActivityLog[]>({
    queryKey: ["/api/activity-logs/recent"],
  });

  return (
    <Card>
      <CardHeader className="px-6 py-4">
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      
      <div className="border-t border-gray-200 divide-y divide-gray-200">
        {isLoading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Loading activities...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500">Error loading activities</p>
          </div>
        ) : data && data.length > 0 ? (
          data.map((activity) => {
            const { badge, icon } = getActivityMeta(activity.activityType);
            const details = formatActivityDetails(activity);
            const category = formatActivityCategory(activity);
            const timestamp = new Date(activity.timestamp);
            const timeString = format(timestamp, "MMM d 'at' h:mm a");
            const isToday = timestamp.toDateString() === new Date().toDateString();
            const isYesterday = new Date(timestamp.setDate(timestamp.getDate() + 1)).toDateString() === new Date().toDateString();
            const displayDate = isToday ? `Today at ${format(timestamp, "h:mm a")}` : 
                              isYesterday ? `Yesterday at ${format(timestamp, "h:mm a")}` : 
                              timeString;
            
            return (
              <div key={activity.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#0F766E] truncate">
                    {activity.description}
                  </p>
                  {details && (
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badge}`}>
                        {details}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {icon}
                      {category}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <Clock size={14} className="flex-shrink-0 mr-1.5 text-gray-400" />
                    <p>{displayDate}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No recent activities</p>
          </div>
        )}
      </div>
      
      <CardFooter className="px-4 py-3 bg-gray-50 text-right">
        <Link href="/activities">
          <a className="text-sm font-medium text-[#0F766E] hover:text-[#0e7490] flex items-center justify-end">
            View all activities <ArrowRight size={16} className="ml-1" />
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecentActivities;
