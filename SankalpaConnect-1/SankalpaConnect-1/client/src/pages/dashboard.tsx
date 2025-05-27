import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { CompanionCard } from '@/components/ui/companion-card';
import { TaskCard } from '@/components/ui/task-card';
import { AccessibilityControls } from '@/components/ui/accessibility-controls';
import { TaskRequestModal } from '@/components/modals/task-request-modal';
import { useAuth } from '@/hooks/useAuth';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLocation } from '@/hooks/useLocation';
import { 
  HandHeart, 
  MapPin, 
  ClipboardList, 
  User, 
  Phone,
  Calendar,
  Clock,
  Star,
  Users,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  const { speak } = useTextToSpeech();
  const { latitude, longitude } = useLocation({ watch: true });
  const { toast } = useToast();
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Fetch active tasks
  const { data: activeTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks/active'],
  });

  // Fetch nearby companions
  const { data: nearbyCompanions, isLoading: companionsLoading } = useQuery({
    queryKey: ['/api/companions/nearby', latitude, longitude],
    enabled: !!(latitude && longitude),
    queryFn: async () => {
      const response = await fetch(
        `/api/companions/nearby?lat=${latitude}&lng=${longitude}&radius=5`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch companions');
      return response.json();
    },
  });

  // Fetch user notifications
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const handleQuickAction = (action: string, announcement: string) => {
    speak(announcement);
    
    switch (action) {
      case 'request-help':
        setShowTaskModal(true);
        break;
      case 'find-companions':
        window.location.href = '/companions';
        break;
      case 'view-tasks':
        window.location.href = '/tasks';
        break;
      case 'edit-profile':
        window.location.href = '/profile';
        break;
    }
  };

  const handleCompanionSelect = (companion: any) => {
    speak(`Selected companion ${companion.user.firstName} ${companion.user.lastName}`);
    toast({
      title: "Companion Selected",
      description: `You can now request assistance from ${companion.user.firstName}`,
    });
  };

  const handleTaskAction = (task: any, action: string) => {
    switch (action) {
      case 'track':
        speak(`Tracking task: ${task.title}`);
        toast({
          title: "Task Tracking",
          description: "Location tracking is now active for this task",
        });
        break;
      case 'cancel':
        speak(`Cancelling task: ${task.title}`);
        // Handle task cancellation
        break;
      case 'contact':
        speak(`Contacting companion for task: ${task.title}`);
        // Handle companion contact
        break;
    }
  };

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' : 'User';
  const unreadNotifications = notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
            <h1 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h1>
            <p className="text-indigo-100">
              {activeTasks?.length > 0 
                ? `You have ${activeTasks.length} active task${activeTasks.length > 1 ? 's' : ''}`
                : 'Ready to get assistance? Find companions near you or request help.'
              }
            </p>
            {unreadNotifications > 0 && (
              <Badge className="mt-2 bg-white text-indigo-600">
                {unreadNotifications} new notification{unreadNotifications > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => handleQuickAction('request-help', 'Opening task request form')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 h-auto justify-start group"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="text-left">
                      <h3 className="font-semibold mb-1">Request Help</h3>
                      <p className="text-sm text-indigo-100">Find a companion for tasks</p>
                    </div>
                    <HandHeart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </div>
                </Button>
                
                <Button
                  onClick={() => handleQuickAction('find-companions', 'Navigating to find companions')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 h-auto justify-start group"
                  asChild
                >
                  <Link href="/companions">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <h3 className="font-semibold mb-1">Find Companions</h3>
                        <p className="text-sm text-emerald-100">View available helpers</p>
                      </div>
                      <MapPin className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </div>
                  </Link>
                </Button>
                
                <Button
                  onClick={() => handleQuickAction('view-tasks', 'Navigating to tasks')}
                  className="bg-amber-600 hover:bg-amber-700 text-white p-6 h-auto justify-start group"
                  asChild
                >
                  <Link href="/tasks">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <h3 className="font-semibold mb-1">My Tasks</h3>
                        <p className="text-sm text-amber-100">Track ongoing requests</p>
                      </div>
                      <ClipboardList className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </div>
                  </Link>
                </Button>
                
                <Button
                  onClick={() => handleQuickAction('edit-profile', 'Navigating to profile')}
                  className="bg-gray-600 hover:bg-gray-700 text-white p-6 h-auto justify-start group"
                  asChild
                >
                  <Link href="/profile">
                    <div className="flex items-center justify-between w-full">
                      <div className="text-left">
                        <h3 className="font-semibold mb-1">My Profile</h3>
                        <p className="text-sm text-gray-100">Update preferences</p>
                      </div>
                      <User className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Nearby Companions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Nearby Companions
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {nearbyCompanions?.length || 0} available
                  </Badge>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/companions">View All</Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {companionsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="w-24 h-4 mb-2" />
                        <Skeleton className="w-32 h-3" />
                      </div>
                      <Skeleton className="w-16 h-8" />
                    </div>
                  ))}
                </div>
              ) : nearbyCompanions?.length > 0 ? (
                <div className="space-y-4">
                  {nearbyCompanions.slice(0, 3).map((companion: any) => (
                    <CompanionCard
                      key={companion.id}
                      companion={companion}
                      onSelect={handleCompanionSelect}
                      distance={Math.random() * 2 + 0.5} // Simplified distance calculation
                      className="border-0 shadow-none hover:bg-gray-50"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No companions available nearby</p>
                  <p className="text-sm">Try expanding your search radius</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="w-5 h-5 mr-2" />
                Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Skeleton className="w-20 h-6" />
                        <Skeleton className="w-16 h-8" />
                      </div>
                      <Skeleton className="w-full h-4 mb-2" />
                      <Skeleton className="w-3/4 h-4" />
                    </div>
                  ))}
                </div>
              ) : activeTasks?.length > 0 ? (
                <div className="space-y-4">
                  {activeTasks.slice(0, 2).map((task: any) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onTrack={(task) => handleTaskAction(task, 'track')}
                      onCancel={(task) => handleTaskAction(task, 'cancel')}
                      onContact={(task) => handleTaskAction(task, 'contact')}
                    />
                  ))}
                  {activeTasks.length > 2 && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/tasks">
                        View All Tasks ({activeTasks.length})
                      </Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No active tasks</p>
                  <p className="text-sm mb-4">Request help to get started</p>
                  <Button
                    onClick={() => setShowTaskModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Request Help
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4">
                  <AvatarImage src={user?.profileImageUrl || ''} alt={userName} />
                  <AvatarFallback className="text-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-gray-900 mb-1">{userName}</h3>
                <p className="text-sm text-gray-500 mb-3">{user?.email}</p>
                
                <div className="flex items-center justify-center space-x-4 text-sm mb-4">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {activeTasks?.length || 0}
                    </div>
                    <div className="text-gray-500">Active Tasks</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {user?.userType === 'companion' ? '4.8' : '-'}
                    </div>
                    <div className="text-gray-500">Rating</div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/profile">Edit Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Accessibility Features */}
          <AccessibilityControls />

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user?.emergencyContacts ? (
                Object.entries(user.emergencyContacts as any).map(([key, contact]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{contact.name}</p>
                      <p className="text-sm text-gray-500">{contact.relation}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        speak(`Calling ${contact.name}`);
                        window.open(`tel:${contact.phone}`);
                      }}
                      aria-label={`Call ${contact.name}`}
                    >
                      <Phone className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-sm">No emergency contacts set</p>
                  <Button variant="link" size="sm" asChild>
                    <Link href="/profile">Add Contacts</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Request Modal */}
      <TaskRequestModal 
        open={showTaskModal} 
        onOpenChange={setShowTaskModal} 
      />
    </div>
  );
}
