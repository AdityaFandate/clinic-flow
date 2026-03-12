import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/authStore';
import type { AppRole } from '@/types';
import logo from '@/assets/clinicos-logo.png';

const roles: { value: AppRole; label: string }[] = [
  { value: 'patient', label: 'Patient' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'admin', label: 'Admin' },
];

const roleRedirects: Record<AppRole, string> = {
  patient: '/patient/dashboard',
  receptionist: '/receptionist/dashboard',
  doctor: '/doctor/daily-view',
  admin: '/admin/dashboard',
};

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

    // Mock login — replace with Supabase auth
    setTimeout(() => {
      setUser({ id: 'mock-user-id', email });
      setRole(selectedRole);
      setProfile({
        id: 'mock-profile',
        user_id: 'mock-user-id',
        full_name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        phone: '+91 98765 43210',
        language_pref: 'english',
        created_at: new Date().toISOString(),
      });
      setLoading(false);
      navigate(roleRedirects[selectedRole]);
    }, 800);
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
                  placeholder="doctor@clinicos.in"
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
                      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                        selectedRole === r.value
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

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button type="button" className="text-primary font-medium hover:underline">
                  Contact your clinic admin
                </button>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
