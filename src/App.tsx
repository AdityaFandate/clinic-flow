import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VoiceAssistantWidget } from "@/components/shared/VoiceAssistantWidget";
import { useAuthStore } from "@/stores/authStore";

import LoginPage from "@/pages/auth/LoginPage";
import PatientDashboard from "@/pages/patient/PatientDashboard";
import BookAppointment from "@/pages/patient/BookAppointment";
import ReceptionistDashboard from "@/pages/receptionist/ReceptionistDashboard";
import ReminderManagement from "@/pages/receptionist/ReminderManagement";
import DoctorDailyView from "@/pages/doctor/DoctorDailyView";
import PatientProfile from "@/pages/doctor/PatientProfile";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Patient */}
          <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/book" element={<ProtectedRoute allowedRoles={['patient']}><BookAppointment /></ProtectedRoute>} />

          {/* Receptionist */}
          <Route path="/receptionist/dashboard" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistDashboard /></ProtectedRoute>} />
          <Route path="/receptionist/quick-book" element={<ProtectedRoute allowedRoles={['receptionist']}><BookAppointment /></ProtectedRoute>} />
          <Route path="/receptionist/reminders" element={<ProtectedRoute allowedRoles={['receptionist']}><ReminderManagement /></ProtectedRoute>} />

          {/* Doctor */}
          <Route path="/doctor/daily-view" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDailyView /></ProtectedRoute>} />
          <Route path="/doctor/patients/:id" element={<ProtectedRoute allowedRoles={['doctor']}><PatientProfile /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><PatientProfile /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <VoiceAssistantWidgetWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

function VoiceAssistantWidgetWrapper() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return null;
  return <VoiceAssistantWidget />;
}

export default App;
