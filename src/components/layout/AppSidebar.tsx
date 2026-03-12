import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import {
  LayoutDashboard, Calendar, Users, Clock, Bell, Settings, Stethoscope,
  FileText, BarChart3, UserCog, Activity, LogOut, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '@/assets/clinicos-logo.png';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navByRole: Record<string, NavItem[]> = {
  patient: [
    { label: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'Book Appointment', href: '/patient/book', icon: Calendar },
    { label: 'Appointments', href: '/patient/appointments', icon: Clock },
    { label: 'Prescriptions', href: '/patient/prescriptions', icon: FileText },
    { label: 'Settings', href: '/patient/settings', icon: Settings },
  ],
  receptionist: [
    { label: 'Dashboard', href: '/receptionist/dashboard', icon: LayoutDashboard },
    { label: 'Appointments', href: '/receptionist/appointments', icon: Calendar },
    { label: 'Patients', href: '/receptionist/patients', icon: Users },
    { label: 'Schedule', href: '/receptionist/schedule', icon: Clock },
    { label: 'Reminders', href: '/receptionist/reminders', icon: Bell },
    { label: 'Settings', href: '/receptionist/settings', icon: Settings },
  ],
  doctor: [
    { label: 'Daily View', href: '/doctor/daily-view', icon: LayoutDashboard },
    { label: 'Patients', href: '/doctor/patients', icon: Users },
    { label: 'Schedule', href: '/doctor/schedule', icon: Clock },
    { label: 'Prescriptions', href: '/doctor/prescriptions', icon: FileText },
    { label: 'Settings', href: '/doctor/settings', icon: Settings },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Doctors', href: '/admin/doctors', icon: Stethoscope },
    { label: 'Staff', href: '/admin/staff', icon: UserCog },
    { label: 'Patients', href: '/admin/patients', icon: Users },
    { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Logs', href: '/admin/logs', icon: Activity },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ],
};

export function AppSidebar() {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { role, logout } = useAuthStore();
  const items = navByRole[role || 'patient'] || [];

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={toggleSidebar} />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="ClinicOS" className="h-8 w-8 rounded-lg object-contain" />
            <span className="text-lg font-semibold text-foreground">ClinicOS</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => useUIStore.getState().setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-3">
          <Link
            to="/login"
            onClick={() => logout()}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>
    </>
  );
}
