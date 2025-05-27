import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Clock, Phone } from 'lucide-react';
import type { Companion, User } from '@shared/schema';

interface CompanionCardProps {
  companion: Companion & { user: User };
  onSelect?: (companion: Companion & { user: User }) => void;
  onContact?: (companion: Companion & { user: User }) => void;
  distance?: number;
  className?: string;
}

export function CompanionCard({ 
  companion, 
  onSelect, 
  onContact, 
  distance,
  className = '' 
}: CompanionCardProps) {
  const getAvailabilityStatus = () => {
    if (companion.isAvailable) {
      return { text: 'Available', color: 'bg-green-500', badge: 'bg-green-100 text-green-800' };
    }
    return { text: 'Busy', color: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-800' };
  };

  const status = getAvailabilityStatus();

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-current" />
        ))}
        {hasHalfStar && <Star className="w-3 h-3 fill-current opacity-50" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />
        ))}
      </div>
    );
  };

  return (
    <Card 
      className={`companion-card hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={() => onSelect?.(companion)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage 
                  src={companion.user.profileImageUrl || ''} 
                  alt={`${companion.user.firstName} ${companion.user.lastName}`} 
                />
                <AvatarFallback>
                  {companion.user.firstName?.[0]}{companion.user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${status.color} rounded-full border-2 border-white`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {companion.user.firstName} {companion.user.lastName}
              </h3>
              
              <div className="flex items-center space-x-1 mb-1">
                {renderStars(companion.rating || 0)}
                <span className="text-sm text-gray-600 ml-1">
                  {companion.rating?.toFixed(1) || 'No rating'}
                </span>
                <span className="text-sm text-gray-400">
                  ({companion.totalTasks} tasks)
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {companion.specialties?.slice(0, 2).map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {(companion.specialties?.length || 0) > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{(companion.specialties?.length || 0) - 2} more
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-500 space-x-3">
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {distance ? `${distance.toFixed(1)} miles away` : 'Distance unknown'}
                </div>
                {companion.hourlyRate && (
                  <div className="flex items-center">
                    <span>${companion.hourlyRate}/hr</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <Badge className={status.badge}>
              {status.text}
            </Badge>
            
            <div className="flex space-x-1">
              {onContact && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onContact(companion);
                  }}
                  aria-label={`Contact ${companion.user.firstName}`}
                >
                  <Phone className="w-3 h-3" />
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.(companion);
                }}
              >
                Select
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
