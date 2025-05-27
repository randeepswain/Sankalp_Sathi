import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, User, MapPin, Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';
import type { Task } from '@shared/schema';

interface TaskCardProps {
  task: Task;
  onTrack?: (task: Task) => void;
  onCancel?: (task: Task) => void;
  onContact?: (task: Task) => void;
  onComplete?: (task: Task) => void;
  className?: string;
  companionInfo?: {
    name: string;
    profileImage?: string;
    rating?: number;
  };
}

export function TaskCard({ 
  task, 
  onTrack, 
  onCancel, 
  onContact, 
  onComplete,
  companionInfo,
  className = '' 
}: TaskCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          text: 'Pending', 
          color: 'bg-yellow-100 text-yellow-800',
          bgColor: 'bg-yellow-50'
        };
      case 'assigned':
        return { 
          text: 'Assigned', 
          color: 'bg-blue-100 text-blue-800',
          bgColor: 'bg-blue-50'
        };
      case 'in_progress':
        return { 
          text: 'In Progress', 
          color: 'bg-green-100 text-green-800',
          bgColor: 'bg-green-50'
        };
      case 'completed':
        return { 
          text: 'Completed', 
          color: 'bg-gray-100 text-gray-800',
          bgColor: 'bg-gray-50'
        };
      case 'cancelled':
        return { 
          text: 'Cancelled', 
          color: 'bg-red-100 text-red-800',
          bgColor: 'bg-red-50'
        };
      default:
        return { 
          text: 'Unknown', 
          color: 'bg-gray-100 text-gray-800',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const statusConfig = getStatusConfig(task.status);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'normal':
        return 'text-gray-600';
      case 'low':
        return 'text-gray-500';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Not scheduled';
    try {
      return format(new Date(date), 'MMM d, yyyy h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const formatTimeAgo = (date: string | Date | null) => {
    if (!date) return '';
    try {
      const taskDate = new Date(date);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - taskDate.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hrs ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    } catch {
      return '';
    }
  };

  return (
    <Card className={`${statusConfig.bgColor} border transition-all duration-200 hover:shadow-md ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Badge className={statusConfig.color}>
              {statusConfig.text}
            </Badge>
            {task.priority && task.priority !== 'normal' && (
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority.toUpperCase()}
              </Badge>
            )}
            <span className="text-sm text-gray-500">
              {formatTimeAgo(task.createdAt)}
            </span>
          </div>
          
          <div className="flex space-x-1">
            {task.status === 'in_progress' && onTrack && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTrack(task)}
              >
                Track
              </Button>
            )}
            
            {task.status === 'pending' && onCancel && (
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => onCancel(task)}
              >
                Cancel
              </Button>
            )}
            
            {(task.status === 'assigned' || task.status === 'in_progress') && onContact && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onContact(task)}
              >
                <Phone className="w-3 h-3 mr-1" />
                Contact
              </Button>
            )}
            
            {task.status === 'in_progress' && onComplete && (
              <Button
                size="sm"
                onClick={() => onComplete(task)}
              >
                Complete
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">{task.title}</h3>
          
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {task.scheduledTime && (
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(task.scheduledTime)}
              </div>
            )}
            
            {task.estimatedDuration && (
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {task.estimatedDuration} mins
              </div>
            )}
            
            {task.cost && (
              <div className="flex items-center">
                <span>${task.cost}</span>
              </div>
            )}
          </div>
          
          {companionInfo && task.status !== 'pending' && (
            <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
              <Avatar className="w-6 h-6">
                <AvatarImage src={companionInfo.profileImage} alt={companionInfo.name} />
                <AvatarFallback className="text-xs">
                  {companionInfo.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-700">{companionInfo.name}</span>
              {companionInfo.rating && (
                <div className="flex items-center text-xs text-gray-500">
                  <span>★ {companionInfo.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          )}
          
          {task.status === 'pending' && (
            <div className="flex items-center text-sm text-gray-500 pt-2 border-t border-gray-200">
              <User className="w-3 h-3 mr-1" />
              <span>Finding companion...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
