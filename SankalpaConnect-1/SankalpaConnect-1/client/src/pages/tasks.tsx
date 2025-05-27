import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskCard } from '@/components/ui/task-card';
import { TaskRequestModal } from '@/components/modals/task-request-modal';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ClipboardList, 
  Plus, 
  Filter, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function Tasks() {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  
  const { speak } = useTextToSpeech();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all tasks
  const { data: allTasks, isLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number; updates: any }) => {
      const response = await apiRequest('PATCH', `/api/tasks/${taskId}`, updates);
      return response.json();
    },
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task Updated",
        description: `Task status changed to ${updatedTask.status}`,
      });
      speak(`Task status updated to ${updatedTask.status}`);
    },
    onError: (error) => {
      console.error('Failed to update task:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleTaskAction = async (task: any, action: string) => {
    switch (action) {
      case 'cancel':
        await updateTaskMutation.mutateAsync({
          taskId: task.id,
          updates: { status: 'cancelled' }
        });
        break;
      case 'complete':
        await updateTaskMutation.mutateAsync({
          taskId: task.id,
          updates: { status: 'completed', endTime: new Date().toISOString() }
        });
        break;
      case 'track':
        speak(`Tracking task: ${task.title}`);
        toast({
          title: "Task Tracking",
          description: "Real-time tracking is active for this task",
        });
        break;
      case 'contact':
        speak(`Opening contact options for task: ${task.title}`);
        toast({
          title: "Contact Companion",
          description: "Companion contact options are being prepared",
        });
        break;
    }
  };

  const getTasksByStatus = (status?: string) => {
    if (!allTasks) return [];
    if (!status || status === 'all') return allTasks;
    return allTasks.filter((task: any) => task.status === status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'assigned':
      case 'in_progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <ClipboardList className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'assigned':
      case 'in_progress':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const tabData = [
    { value: 'all', label: 'All Tasks', count: allTasks?.length || 0 },
    { value: 'pending', label: 'Pending', count: getTasksByStatus('pending').length },
    { value: 'in_progress', label: 'Active', count: getTasksByStatus('in_progress').length + getTasksByStatus('assigned').length },
    { value: 'completed', label: 'Completed', count: getTasksByStatus('completed').length },
    { value: 'cancelled', label: 'Cancelled', count: getTasksByStatus('cancelled').length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tasks</h1>
          <p className="text-gray-600">
            Manage your task requests and track their progress
          </p>
        </div>
        <Button 
          onClick={() => {
            setShowTaskModal(true);
            speak('Opening new task request form');
          }}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {tabData.slice(1).map((tab) => (
          <Card key={tab.value}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{tab.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{tab.count}</p>
                </div>
                <div className={`${getStatusColor(tab.value)} opacity-60`}>
                  {getStatusIcon(tab.value)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          {tabData.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center space-x-1">
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabData.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            <TasksContent
              tasks={tab.value === 'in_progress' 
                ? [...getTasksByStatus('assigned'), ...getTasksByStatus('in_progress')]
                : getTasksByStatus(tab.value === 'all' ? undefined : tab.value)
              }
              isLoading={isLoading}
              onTaskAction={handleTaskAction}
              emptyMessage={`No ${tab.label.toLowerCase()} tasks`}
            />
          </TabsContent>
        ))}
      </Tabs>

      {/* Task Request Modal */}
      <TaskRequestModal 
        open={showTaskModal} 
        onOpenChange={setShowTaskModal} 
      />
    </div>
  );
}

interface TasksContentProps {
  tasks: any[];
  isLoading: boolean;
  onTaskAction: (task: any, action: string) => void;
  emptyMessage: string;
}

function TasksContent({ tasks, isLoading, onTaskAction, emptyMessage }: TasksContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex space-x-2">
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-20 h-4" />
                </div>
                <Skeleton className="w-16 h-8" />
              </div>
              <Skeleton className="w-full h-4 mb-2" />
              <Skeleton className="w-3/4 h-4 mb-4" />
              <div className="flex space-x-4">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-16 h-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyMessage}</h3>
          <p className="text-gray-600 mb-4">
            {emptyMessage.includes('No all') 
              ? 'You haven\'t created any tasks yet. Start by requesting help with something you need assistance with.'
              : `You don't have any ${emptyMessage.split(' ')[1]} tasks at the moment.`
            }
          </p>
          {emptyMessage.includes('No all') && (
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Task
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onTrack={(task) => onTaskAction(task, 'track')}
          onCancel={(task) => onTaskAction(task, 'cancel')}
          onContact={(task) => onTaskAction(task, 'contact')}
          onComplete={(task) => onTaskAction(task, 'complete')}
          companionInfo={task.companionId ? {
            name: 'Companion Name', // This would come from the companion data
            rating: 4.8,
          } : undefined}
        />
      ))}
    </div>
  );
}
