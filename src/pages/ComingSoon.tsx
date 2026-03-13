import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export default function ComingSoon() {
  const { profile: authProfile, user, setProfile: setAuthProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  
  // Dummy data representing user profile mixed with global state
  const [profile, setProfile] = useState({
    username: authProfile?.full_name || 'Dr. Rahul Sharma',
    email: user?.email || 'dr.rahul@clinicflow.com',
    phone: authProfile?.phone || '+91 98765 43210',
    specialty: 'Cardiologist',
    address: '123 Health Ave, Medical District, Mumbai',
    bio: 'Experienced cardiologist with 15+ years of practice.'
  });

  // State to hold edit form data
  const [editForm, setEditForm] = useState({ ...profile });

  useEffect(() => {
    // Keep local form in sync if external auth state changes
    setProfile(prev => ({
      ...prev,
      username: authProfile?.full_name || prev.username,
      email: user?.email || prev.email,
      phone: authProfile?.phone || prev.phone,
    }));
    setEditForm(prev => ({
      ...prev,
      username: authProfile?.full_name || prev.username,
      email: user?.email || prev.email,
      phone: authProfile?.phone || prev.phone,
    }));
  }, [authProfile, user]);

  const handleSave = () => {
    setProfile(editForm);
    
    // Sync changes to global authStore so Navbar updates
    if (authProfile) {
      setAuthProfile({
        ...authProfile,
        full_name: editForm.username,
        phone: editForm.phone,
      });
    }
    
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditForm({ ...profile });
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
              <p className="text-sm text-muted-foreground">Manage your personal and professional details</p>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit className="h-4 w-4" /> Edit Profile
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your photo and personal details here.</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="username">Full Name</Label>
                    <Input 
                      id="username" 
                      value={editForm.username} 
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input 
                      id="specialty" 
                      value={editForm.specialty} 
                      onChange={(e) => setEditForm({...editForm, specialty: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={editForm.email} 
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={editForm.phone} 
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Clinic Address</Label>
                  <Input 
                    id="address" 
                    value={editForm.address} 
                    onChange={(e) => setEditForm({...editForm, address: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Input 
                    id="bio" 
                    value={editForm.bio} 
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})} 
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={handleCancel} className="gap-2">
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Full Name</span>
                    <p className="font-medium text-foreground">{profile.username}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Specialty</span>
                    <p className="font-medium text-foreground">{profile.specialty}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Email Address</span>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {profile.email}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground block mb-1">Phone Number</span>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {profile.phone}
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <span className="text-sm text-muted-foreground block mb-1">Clinic Address</span>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {profile.address}
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <span className="text-sm text-muted-foreground block mb-1">Professional Bio</span>
                  <p className="text-foreground">{profile.bio}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
