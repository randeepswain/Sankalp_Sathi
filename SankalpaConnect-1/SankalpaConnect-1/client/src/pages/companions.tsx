import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CompanionCard } from '@/components/ui/companion-card';
import { TaskRequestModal } from '@/components/modals/task-request-modal';
import { useLocation } from '@/hooks/useLocation';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  MapPin, 
  Filter, 
  Star, 
  Users, 
  Map,
  List,
  RefreshCw
} from 'lucide-react';

export default function Companions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadius, setSelectedRadius] = useState('5');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedCompanion, setSelectedCompanion] = useState<any>(null);

  const { latitude, longitude, refreshLocation, loading: locationLoading } = useLocation({ watch: true });
  const { speak } = useTextToSpeech();
  const { toast } = useToast();

  // Fetch nearby companions
  const { data: companions, isLoading, refetch } = useQuery({
    queryKey: ['/api/companions/nearby', latitude, longitude, selectedRadius],
    enabled: !!(latitude && longitude),
    queryFn: async () => {
      const response = await fetch(
        `/api/companions/nearby?lat=${latitude}&lng=${longitude}&radius=${selectedRadius}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch companions');
      return response.json();
    },
  });

  const specialties = [
    'Medical assistance',
    'Mobility support',
    'Shopping assistance',
    'Transportation',
    'Reading assistance',
    'Technology help',
    'Household tasks',
    'Social companion',
    'Emergency support',
  ];

  const handleCompanionSelect = (companion: any) => {
    setSelectedCompanion(companion);
    setShowTaskModal(true);
    speak(`Selected companion ${companion.user.firstName} ${companion.user.lastName}. Opening task request form.`);
  };

  const handleCompanionContact = (companion: any) => {
    speak(`Contacting ${companion.user.firstName} ${companion.user.lastName}`);
    toast({
      title: "Contact Companion",
      description: `Initiating contact with ${companion.user.firstName}`,
    });
    // In a real app, this would open a chat or call interface
  };

  const handleRefresh = () => {
    speak('Refreshing companion list');
    refetch();
    refreshLocation();
  };

  const filteredCompanions = companions?.filter((companion: any) => {
    const matchesSearch = !searchQuery || 
      `${companion.user.firstName} ${companion.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companion.specialties?.some((specialty: string) => 
        specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesSpecialty = !selectedSpecialty || 
      companion.specialties?.includes(selectedSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  const sortedCompanions = filteredCompanions?.sort((a: any, b: any) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'tasks':
        return (b.totalTasks || 0) - (a.totalTasks || 0);
      case 'distance':
      default:
        // In a real app, this would be actual distance calculation
        return Math.random() - 0.5;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Companions</h1>
        <p className="text-gray-600">
          Connect with verified companions near you for assistance with daily tasks
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Radius */}
            <div>
              <Label htmlFor="radius">Distance</Label>
              <Select value={selectedRadius} onValueChange={setSelectedRadius}>
                <SelectTrigger>
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 mile</SelectItem>
                  <SelectItem value="3">3 miles</SelectItem>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Specialty */}
            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Any specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any specialty</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div>
              <Label htmlFor="sort">Sort by</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="tasks">Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || locationLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              {latitude && longitude && (
                <Badge variant="outline" className="text-green-600">
                  <MapPin className="w-3 h-3 mr-1" />
                  Location enabled
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
                disabled
              >
                <Map className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Available Companions</h2>
          {sortedCompanions && (
            <Badge variant="outline">
              {sortedCompanions.length} found
            </Badge>
          )}
        </div>
      </div>

      {/* Companions List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="w-24 h-4 mb-2" />
                    <Skeleton className="w-32 h-3" />
                  </div>
                </div>
                <Skeleton className="w-full h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !latitude || !longitude ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Access Required</h3>
            <p className="text-gray-600 mb-4">
              We need your location to find companions near you. Please enable location access and try again.
            </p>
            <Button onClick={refreshLocation} disabled={locationLoading}>
              {locationLoading ? 'Getting Location...' : 'Enable Location'}
            </Button>
          </CardContent>
        </Card>
      ) : sortedCompanions?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCompanions.map((companion: any) => (
            <CompanionCard
              key={companion.id}
              companion={companion}
              onSelect={handleCompanionSelect}
              onContact={handleCompanionContact}
              distance={Math.random() * 5 + 0.5} // Simplified distance calculation
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Companions Found</h3>
            <p className="text-gray-600 mb-4">
              No companions match your current search criteria. Try adjusting your filters or expanding your search radius.
            </p>
            <div className="flex justify-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSpecialty('');
                  setSelectedRadius('10');
                }}
              >
                Clear Filters
              </Button>
              <Button onClick={handleRefresh}>
                Refresh Search
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Request Modal */}
      <TaskRequestModal 
        open={showTaskModal} 
        onOpenChange={setShowTaskModal} 
      />
    </div>
  );
}
