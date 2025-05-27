import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Companions from "@/pages/companions";
import Tasks from "@/pages/tasks";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import { Header } from "@/components/layouts/header";
import { MobileNav } from "@/components/layouts/mobile-nav";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { toast } = useToast();
  const { announceNotification } = useTextToSpeech();
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);

  // WebSocket connection for real-time updates
  useWebSocket({
    onMessage: (message) => {
      switch (message.type) {
        case 'task_update':
          toast({
            title: "Task Update",
            description: `Your task has been ${message.data.task.status}`,
          });
          announceNotification(`Task update: Your task has been ${message.data.task.status}`);
          break;
        case 'new_task':
          if (user?.userType === 'companion') {
            toast({
              title: "New Task Available",
              description: "A new task is available near you",
            });
            announceNotification("New task available near you");
          }
          break;
        case 'emergency_alert':
          toast({
            title: "Emergency Alert",
            description: "Emergency assistance has been requested",
            variant: "destructive",
          });
          announceNotification("Emergency alert: Assistance has been requested");
          break;
        case 'location_update':
          // Handle location updates silently
          break;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onProfileClick={() => window.location.href = '/profile'}
        onSettingsClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
      />
      
      <main className="pb-20 md:pb-0">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/companions" component={Companions} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/profile" component={Profile} />
          {user?.userType === 'admin' && (
            <Route path="/admin" component={Admin} />
          )}
          <Route component={NotFound} />
        </Switch>
      </main>

      <MobileNav />
      
      {/* Accessibility Panel Overlay */}
      {showAccessibilityPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Accessibility Settings</h3>
              <button 
                onClick={() => setShowAccessibilityPanel(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close accessibility panel"
              >
                ×
              </button>
            </div>
            {/* Accessibility controls would go here */}
            <p className="text-sm text-gray-600 mb-4">
              Accessibility features are available in your profile settings and throughout the application.
            </p>
            <button 
              onClick={() => setShowAccessibilityPanel(false)}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
