import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLocation } from '@/hooks/useLocation';
import { Calendar, Clock, MapPin, Camera, X } from 'lucide-react';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  taskType: z.string().min(1, 'Task type is required'),
  priority: z.enum(['low', 'normal', 'high', 'emergency']).default('normal'),
  scheduledTime: z.string().optional(),
  estimatedDuration: z.coerce.number().min(15, 'Minimum duration is 15 minutes').optional(),
  isRecurring: z.boolean().default(false),
  specialRequirements: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskRequestModal({ open, onOpenChange }: TaskRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { speak } = useTextToSpeech();
  const { latitude, longitude } = useLocation();
  const queryClient = useQueryClient();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      taskType: '',
      priority: 'normal',
      scheduledTime: '',
      estimatedDuration: 60,
      isRecurring: false,
      specialRequirements: '',
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const taskData = {
        ...data,
        location: latitude && longitude ? { lat: latitude, lng: longitude } : null,
        scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : null,
      };
      
      const response = await apiRequest('POST', '/api/tasks', taskData);
      return response.json();
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/active'] });
      
      toast({
        title: "Task Request Submitted",
        description: "We are finding a suitable companion for you.",
      });
      
      speak("Task request submitted successfully. We are finding a suitable companion for you.");
      
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      console.error('Failed to create task:', error);
      toast({
        title: "Failed to Submit Request",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      
      speak("Failed to submit task request. Please try again.");
    },
  });

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      await createTaskMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const taskTypes = [
    { value: 'shopping', label: 'Shopping Assistance' },
    { value: 'medical', label: 'Medical Appointment' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'reading', label: 'Reading Assistance' },
    { value: 'mobility', label: 'Mobility Support' },
    { value: 'household', label: 'Household Tasks' },
    { value: 'technology', label: 'Technology Help' },
    { value: 'social', label: 'Social Companion' },
    { value: 'emergency', label: 'Emergency Assistance' },
    { value: 'other', label: 'Other' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'emergency', label: 'Emergency' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Request Task Help
          </DialogTitle>
          <DialogDescription>
            Provide details about the assistance you need, and we'll find a suitable companion for you.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Task Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of what you need help with"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Task Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select task type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {taskTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
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
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed information about what help you need, any specific requirements, location details, etc."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include specific details like location, time constraints, special requirements, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scheduled Time and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="datetime-local"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>When do you need this assistance?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="15"
                        step="15"
                        placeholder="60"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>How long do you expect this to take?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Special Requirements */}
            <FormField
              control={form.control}
              name="specialRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special skills, certifications, or requirements for the companion (e.g., CPR certified, sign language, specific vehicle type, etc.)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurring Task */}
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Recurring Task</FormLabel>
                    <FormDescription>
                      This is a recurring task that will need regular assistance
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Location Info */}
            {latitude && longitude && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center text-sm text-green-700">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>Your current location will be shared with the companion</span>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
