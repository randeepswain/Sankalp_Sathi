import { Button } from '@/components/ui/button';
import { EmergencyButton } from '@/components/ui/emergency-button';
import { Home, Search, ClipboardList, User } from 'lucide-react';
import { useLocation } from 'wouter';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className = '' }: MobileNavProps) {
  const [location, navigate] = useLocation();
  const { speak } = useTextToSpeech();

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/',
      isActive: location === '/',
    },
    {
      icon: Search,
      label: 'Find',
      path: '/companions',
      isActive: location === '/companions',
    },
    {
      icon: ClipboardList,
      label: 'Tasks',
      path: '/tasks',
      isActive: location === '/tasks',
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
      isActive: location === '/profile',
    },
  ];

  const handleNavigation = (path: string, label: string) => {
    navigate(path);
    speak(`Navigated to ${label}`);
  };

  return (
    <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40 ${className}`}>
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.path}
              variant="ghost"
              className={`flex flex-col items-center py-2 px-3 space-y-1 h-auto min-w-0 ${
                item.isActive 
                  ? 'text-indigo-600 bg-indigo-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleNavigation(item.path, item.label)}
              aria-label={`Navigate to ${item.label}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
        
        {/* Emergency Button */}
        <EmergencyButton variant="mobile" />
      </div>
    </div>
  );
}
