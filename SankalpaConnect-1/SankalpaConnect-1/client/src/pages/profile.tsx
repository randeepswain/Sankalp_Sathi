import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { AccessibilityControls } from '@/components/ui/accessibility-controls';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Heart,
  Settings,
  Camera,
  Plus,
  X,
  Save
} from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  userType: z.enum(['user', 'companion']),
  disabilityType: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  medicalInfo: z.string().optional(),
  preferredLanguage: z.string().default('en'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { speak } = useTextToSpeech();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<Array<{
    name: string;
    phone: string;
    relation: string;
  }>>([]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      userType: 'user',
      disabilityType: '',
      accessibilityNeeds: '',
      medicalInfo: '',
      preferredLanguage: 'en',
    },
  });

  // Load user data into form
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        userType: user.userType as any || 'user',
        disabilityType: user.disabilityType || '',
        accessibilityNeeds: user.accessibilityNeeds || '',
        medicalInfo: user.medicalInfo || '',
        preferredLanguage: user.preferredLanguage || 'en',
      });

      if (user.emergencyContacts) {
        setEmergencyContacts(Object.values(user.emergencyContacts as any) || []);
      }
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await apiRequest('PATCH', '/api/profile', {
        ...data,
        emergencyContacts: emergencyContacts.reduce((acc, contact, index) => {
          acc[`contact_${index}`] = contact;
          return acc;
        }, {} as any),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      speak("Profile updated successfully");
    },
    onError: (error) => {
      console.error('Failed to update profile:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      speak("Profile update failed. Please try again.");
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([...emergencyContacts, { name: '', phone: '', relation: '' }]);
  };

  const updateEmergencyContact = (index: number, field: string, value: string) => {
    const updated = [...emergencyContacts];
    updated[index] = { ...updated[index], [field]: value };
    setEmergencyContacts(updated);
  };

  const removeEmergencyContact = (index: number) => {
    setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
  };

  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' : 'User';

  const disabilityTypes = [
    'Visual impairment',
    'Hearing impairment',
    'Mobility impairment',
    'Cognitive disability',
    'Multiple disabilities',
    'Other',
    'Prefer not to say',
  ];

  const relations = [
    'Spouse',
    'Parent',
    'Child',
    'Sibling',
    'Friend',
    'Caregiver',
    'Doctor',
    'Other',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your personal information and preferences
          </p>
        </div>
        
        {!isEditing ? (
          <Button 
            onClick={() => {
              setIsEditing(true);
              speak('Editing profile');
            }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                form.reset();
                speak('Cancelled editing');
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)}
              disabled={updateProfileMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Profile Picture */}
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.profileImageUrl || ''} alt={userName} />
                  <AvatarFallback className="text-lg">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button variant="outline" size="sm" disabled>
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                )}
              </div>

              <Form {...form}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditing} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" disabled />
                        </FormControl>
                        <FormDescription>
                          Email cannot be changed after registration
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!isEditing}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">User (Seeking Assistance)</SelectItem>
                            <SelectItem value="companion">Companion (Providing Assistance)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="preferredLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Language</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Form>
            </CardContent>
          </Card>

          {/* Accessibility & Medical */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Accessibility & Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="disabilityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disability Type (Optional)</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={!isEditing}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select if applicable" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None / Not applicable</SelectItem>
                            {disabilityTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          This information helps us match you with appropriate companions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accessibilityNeeds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accessibility Needs</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe any specific accessibility requirements or accommodations you need..."
                            disabled={!isEditing}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Information (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Any relevant medical information, allergies, or conditions that companions should be aware of..."
                            disabled={!isEditing}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          This information is kept private and only shared with approved companions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Emergency Contacts
                </CardTitle>
                {isEditing && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addEmergencyContact}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {emergencyContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No emergency contacts added</p>
                  {isEditing && (
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={addEmergencyContact}
                    >
                      Add First Contact
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {emergencyContacts.map((contact, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Name</Label>
                            <Input
                              value={contact.name}
                              onChange={(e) => updateEmergencyContact(index, 'name', e.target.value)}
                              placeholder="Full name"
                            />
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={contact.phone}
                              onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                              placeholder="Phone number"
                              type="tel"
                            />
                          </div>
                          <div className="flex items-end space-x-2">
                            <div className="flex-1">
                              <Label>Relation</Label>
                              <Select 
                                value={contact.relation}
                                onValueChange={(value) => updateEmergencyContact(index, 'relation', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                  {relations.map((relation) => (
                                    <SelectItem key={relation} value={relation}>
                                      {relation}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeEmergencyContact(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{contact.name}</p>
                            <p className="text-sm text-gray-500">{contact.relation}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">{contact.phone}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`tel:${contact.phone}`)}
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Call
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verification Status</span>
                <Badge variant={user?.isVerified ? "default" : "secondary"}>
                  {user?.isVerified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Type</span>
                <Badge variant="outline">
                  {user?.userType === 'companion' ? 'Companion' : 'User'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                </span>
              </div>

              {!user?.isVerified && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Complete your profile to get verified and access all features.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Accessibility Controls */}
          <AccessibilityControls />

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Privacy Settings
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Notification Preferences
              </Button>
              
              <Separator />
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={() => window.location.href = '/api/logout'}
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
