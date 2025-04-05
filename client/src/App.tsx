import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Finances from "@/pages/finances";
import Production from "@/pages/production";
import Inventory from "@/pages/inventory";
import Health from "@/pages/health";
import Maintenance from "@/pages/maintenance";
import Research from "@/pages/research";
import Analytics from "@/pages/analytics";
import Exports from "@/pages/exports";
import AuthPage from "@/pages/auth-page";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import FloatingActionMenu from "@/components/ui/floating-action-menu";
import { ProtectedRoute } from "@/lib/protected-route";
import { useState, useEffect } from "react";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [location] = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, [location]);

  // Show only auth page layout when on auth page or not authenticated
  const showAppLayout = isAuthenticated && location !== '/auth';

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden">
        {showAppLayout && <Sidebar open={sidebarOpen} onClose={closeSidebar} />}
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {showAppLayout && <Header toggleSidebar={toggleSidebar} />}
          
          <main className={`flex-1 overflow-y-auto ${showAppLayout ? 'scrollbar-thin bg-neutral-50' : ''}`}>
            <Switch>
              <Route path="/auth" component={AuthPage} />
              <ProtectedRoute path="/" component={Dashboard} />
              <ProtectedRoute path="/finances" component={Finances} />
              <ProtectedRoute path="/production" component={Production} />
              <ProtectedRoute path="/inventory" component={Inventory} />
              <ProtectedRoute path="/health" component={Health} />
              <ProtectedRoute path="/maintenance" component={Maintenance} />
              <ProtectedRoute path="/research" component={Research} />
              <ProtectedRoute path="/analytics" component={Analytics} />
              <ProtectedRoute path="/exports" component={Exports} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
      
      {/* Only show floating action menu when authenticated */}
      {showAppLayout && <FloatingActionMenu />}
      
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
