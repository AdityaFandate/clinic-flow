import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { VoiceAssistantWidget } from "@/components/shared/VoiceAssistantWidget";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "./lib/supabase";
import type { AppRole } from "@/types";

import LoginPage from "@/pages/auth/LoginPage";
import PatientDashboard from "@/pages/patient/PatientDashboard";
import BookAppointment from "@/pages/patient/BookAppointment";
import ReceptionistDashboard from "@/pages/receptionist/ReceptionistDashboard";
import ReceptionistAppointments from "@/pages/receptionist/ReceptionistAppointments";
import ReceptionistPatients from "@/pages/receptionist/ReceptionistPatients";
import ReminderManagement from "@/pages/receptionist/ReminderManagement";
import DoctorDailyView from "@/pages/doctor/DoctorDailyView";
import PatientProfile from "@/pages/doctor/PatientProfile";
import WritePrescription from "@/pages/doctor/WritePrescription";
import SchedulePage from "@/pages/shared/SchedulePage";
import ComingSoon from "@/pages/ComingSoon";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, role, isLoading } = useAuthStore();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const HomeRedirect = () => {
  const { isAuthenticated, role, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  const roleRedirects: Record<string, string> = {
    patient: '/patient/dashboard',
    receptionist: '/receptionist/dashboard',
    doctor: '/doctor/daily-view',
  };
  
  return <Navigate to={roleRedirects[role || 'patient']} replace />;
};

const App = () => {
  const { setUser, setRole, setLoading } = useAuthStore();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({ id: session.user.id, email: session.user.email || "" });
        
        // Restore role from local storage if available
        const savedRole = localStorage.getItem('clinicos_pending_role') as AppRole;
        if (savedRole) {
          setRole(savedRole);
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({ id: session.user.id, email: session.user.email || "" });
        const savedRole = localStorage.getItem('clinicos_pending_role') as AppRole;
        if (savedRole) setRole(savedRole);
      } else {
        setUser(null);
        setRole(null);
        localStorage.removeItem('clinicos_pending_role');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setRole, setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Patient */}
            <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/book" element={<ProtectedRoute allowedRoles={['patient']}><BookAppointment /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><ComingSoon /></ProtectedRoute>} />
            <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['patient']}><ComingSoon /></ProtectedRoute>} />
            <Route path="/patient/settings" element={<ProtectedRoute allowedRoles={['patient']}><ComingSoon /></ProtectedRoute>} />

            {/* Receptionist */}
            <Route path="/receptionist/dashboard" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistDashboard /></ProtectedRoute>} />
            <Route path="/receptionist/quick-book" element={<ProtectedRoute allowedRoles={['receptionist']}><BookAppointment /></ProtectedRoute>} />
            <Route path="/receptionist/appointments" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistAppointments /></ProtectedRoute>} />
            <Route path="/receptionist/patients" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistPatients /></ProtectedRoute>} />
            <Route path="/receptionist/schedule" element={<ProtectedRoute allowedRoles={['receptionist']}><SchedulePage /></ProtectedRoute>} />
            <Route path="/receptionist/reminders" element={<ProtectedRoute allowedRoles={['receptionist']}><ReminderManagement /></ProtectedRoute>} />
            <Route path="/receptionist/settings" element={<ProtectedRoute allowedRoles={['receptionist']}><ComingSoon /></ProtectedRoute>} />

            {/* Doctor */}
            <Route path="/doctor/daily-view" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDailyView /></ProtectedRoute>} />
            <Route path="/doctor/patients/:id" element={<ProtectedRoute allowedRoles={['doctor']}><PatientProfile /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><PatientProfile /></ProtectedRoute>} />
            <Route path="/doctor/schedule" element={<ProtectedRoute allowedRoles={['doctor']}><SchedulePage /></ProtectedRoute>} />
            <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['doctor']}><WritePrescription /></ProtectedRoute>} />
            <Route path="/doctor/settings" element={<ProtectedRoute allowedRoles={['doctor']}><ComingSoon /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <VoiceAssistantWidgetWrapper />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

function VoiceAssistantWidgetWrapper() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return null;
  return <VoiceAssistantWidget />;
}

export default App;
