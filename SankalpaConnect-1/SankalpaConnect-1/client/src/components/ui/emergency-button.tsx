import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLocation } from '@/hooks/useLocation';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface EmergencyButtonProps {
  className?: string;
  variant?: 'default' | 'mobile';
}

export function EmergencyButton({ className = '', variant = 'default' }: EmergencyButtonProps) {
  const [isTriggering, setIsTriggering] = useState(false);
  const [confirmPressed, setConfirmPressed] = useState(false);
  const { speak } = useTextToSpeech();
  const { latitude, longitude } = useLocation();
  const { toast } = useToast();

  const handleEmergencyClick = () => {
    if (!confirmPressed) {
      setConfirmPressed(true);
      speak('Emergency button pressed. Press again to confirm emergency alert.');
      toast({
        title: "Emergency Button Pressed",
        description: "Press again within 5 seconds to confirm emergency alert",
        variant: "destructive",
      });

      // Reset confirmation after 5 seconds
      setTimeout(() => {
        setConfirmPressed(false);
      }, 5000);
      return;
    }

    triggerEmergency();
  };

  const triggerEmergency = async () => {
    if (isTriggering) return;

    setIsTriggering(true);
    setConfirmPressed(false);

    try {
      const location = latitude && longitude ? { lat: latitude, lng: longitude } : null;
      
      await apiRequest('POST', '/api/emergency', {
        type: 'sos',
        location,
        notes: 'SOS button triggered by user',
      });

      speak('Emergency services have been notified. Help is on the way.');
      toast({
        title: "Emergency Alert Sent",
        description: "Emergency services have been notified. Your location and medical information have been shared.",
        variant: "destructive",
      });

    } catch (error) {
      console.error('Failed to trigger emergency alert:', error);
      speak('Failed to send emergency alert. Please try again or call emergency services directly.');
      toast({
        title: "Emergency Alert Failed",
        description: "Failed to send emergency alert. Please try calling emergency services directly.",
        variant: "destructive",
      });
    } finally {
      setIsTriggering(false);
    }
  };

  if (variant === 'mobile') {
    return (
      <button
        onClick={handleEmergencyClick}
        disabled={isTriggering}
        className={`flex flex-col items-center py-2 text-red-600 transition-colors ${
          confirmPressed ? 'bg-red-100' : ''
        } ${className}`}
        aria-label={confirmPressed ? "Confirm emergency assistance" : "Emergency assistance"}
      >
        <AlertTriangle className={`text-xl mb-1 ${isTriggering ? 'animate-pulse' : ''}`} />
        <span className="text-xs">SOS</span>
      </button>
    );
  }

  return (
    <Button
      onClick={handleEmergencyClick}
      disabled={isTriggering}
      className={`emergency-btn bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg transition-all duration-200 ${
        confirmPressed ? 'ring-4 ring-red-300 scale-105' : ''
      } ${isTriggering ? 'animate-pulse' : ''} ${className}`}
      aria-label={confirmPressed ? "Confirm emergency assistance" : "Emergency assistance"}
    >
      <Phone className="mr-2 h-4 w-4" />
      {isTriggering ? 'Sending...' : confirmPressed ? 'Confirm SOS' : 'SOS'}
    </Button>
  );
}
