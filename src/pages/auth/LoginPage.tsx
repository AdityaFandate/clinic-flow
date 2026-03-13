import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { AppRole } from '@/types';
import logo from '@/assets/clinicos-logo.png';

const roles: { value: AppRole; label: string }[] = [
  { value: 'patient', label: 'Patient' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'doctor', label: 'Doctor' },
];

const roleRedirects: Record<AppRole, string> = {
  patient: '/patient/dashboard',
  receptionist: '/receptionist/dashboard',
  doctor: '/doctor/daily-view',
} as Record<AppRole, string>;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('patient');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setRole, setProfile } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        setUser({ id: authData.user.id, email: authData.user.email || '' });
        
        // Fetch user role
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        if (userError) {
          console.error("Error fetching user role:", userError);
          // Fallback to selected role if not in DB for now
          setRole(selectedRole); 
        } else if (userData) {
          setRole(userData.role as AppRole);
        }

        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        } else {
           // Fallback profile
           setProfile({
            id: 'mock-profile',
            user_id: authData.user.id,
            full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            phone: '+91 98765 43210',
            language_pref: 'english',
            created_at: new Date().toISOString(),
          });
        }
        
        const finalRole = userData?.role || selectedRole;
        navigate(roleRedirects[finalRole as AppRole], { state: { userId: authData.user.id } });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      localStorage.setItem('clinicos_pending_role', selectedRole);
      console.log(`${window.location.origin}${roleRedirects[selectedRole]}`)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${roleRedirects[selectedRole]}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred during Google sign in');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Branding */}
      <div className="relative hidden w-1/2 items-center justify-center bg-primary lg:flex">
        {/* Medical pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 400 400">
            <pattern id="cross" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M16 0v16H0v8h16v16h8V24h16v-8H24V0h-8z" fill="currentColor" className="text-primary-foreground" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#cross)" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <img src={logo} alt="ClinicOS" className="mb-8 h-24 w-24 rounded-2xl" />
          <h1 className="text-4xl font-bold text-primary-foreground mb-4">ClinicOS</h1>
          <p className="text-xl text-primary-foreground/80">Your clinic, fully automated.</p>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 lg:hidden">
              <img src={logo} alt="ClinicOS" className="mx-auto h-14 w-14 rounded-xl" />
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your ClinicOS account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Role Selector */}
              <div className="space-y-2">
                <Label>Sign in as</Label>
                <div className="flex flex-wrap gap-2">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSelectedRole(r.value)}
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${selectedRole === r.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                        }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </Button>


            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
