import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const [location, setLocation] = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();
  
  // Helper function to get the page title based on the current location
  const getPageTitle = () => {
    switch(location) {
      case '/': return 'Dashboard';
      case '/finances': return 'Finances';
      case '/production': return 'Production';
      case '/inventory': return 'Inventory';
      case '/health': return 'Health Tracking';
      case '/maintenance': return 'Maintenance';
      case '/research': return 'Research Notes';
      case '/analytics': return 'Analytics';
      case '/exports': return 'Export Data';
      default: return 'EggTrack Pro';
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await apiRequest("POST", "/api/logout");
      if (res.ok) {
        // Clear user data from query cache
        queryClient.setQueryData(["/api/user"], null);
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account.",
        });
        setLocation("/auth");
      } else {
        toast({
          title: "Logout failed",
          description: "There was an error logging out. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b border-neutral-100 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center md:hidden">
          <button 
            type="button" 
            className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
            onClick={toggleSidebar}
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
          <div className="ml-3 text-xl font-semibold text-neutral-900 md:hidden">
            {getPageTitle()}
          </div>
        </div>
        
        <div className="hidden md:block">
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
              <i className="ri-search-line"></i>
            </span>
            <input 
              type="search" 
              className="block w-full py-2 pl-10 pr-3 text-sm border border-neutral-200 rounded-md focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:outline-none" 
              placeholder="Search..." 
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <button type="button" className="p-2 text-neutral-500 hover:text-neutral-700 focus:outline-none relative">
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute top-3 right-3 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>
          
          <div className="ml-4 relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    FM
                  </div>
                  <span className="ml-2 text-sm font-medium text-neutral-700 hidden md:block">
                    Farm Manager
                  </span>
                  <i className="ri-arrow-down-s-line ml-1 text-neutral-500 hidden md:block"></i>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-red-500 focus:text-red-500" 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    "Logout"
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
