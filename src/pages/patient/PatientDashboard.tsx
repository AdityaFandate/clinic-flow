import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Appointment } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppointmentCard } from '@/components/shared/AppointmentCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Calendar, Clock, FileText, Plus } from 'lucide-react';
import { mockPrescriptions } from '@/lib/mock-data';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PatientDashboard() {
  const location = useLocation();
  const { user } = useAuthStore();
  const userId = location.state?.userId || user?.id; // Fallback to auth store if state is missing

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchAppointments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          doctor:doctors(profile:profiles(*)),
          time_slot:time_slots(*)
        `)
        .eq('patient_id', userId);

      if (error) {
        console.error('Error fetching appointments:', error);
      } else if (data) {
        setAppointments(data as any as Appointment[]);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, [userId]);

  const upcoming = appointments.filter(a => a.status === 'confirmed' || a.status === 'scheduled');
  const history = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">My Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your appointments and health records</p>
          </div>
          <Button asChild>
            <Link to="/patient/book">
              <Plus className="h-4 w-4 mr-1" /> Book Appointment
            </Link>
          </Button>
        </div>

        {/* Upcoming Appointments */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" /> Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Loading appointments...</p>
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming appointments</p>
            ) : (
              upcoming.map(a => <AppointmentCard key={a.id} appointment={a} />)
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Appointment History */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-muted-foreground" /> History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Loading history...</p>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No appointment history</p>
              ) : (
                history.map(a => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.doctor?.profile?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{a.time_slot?.date} · {a.time_slot?.start_time}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Prescriptions */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-muted-foreground" /> Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockPrescriptions.map(rx => (
                <div key={rx.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{rx.created_at}</p>
                    <span className="text-xs text-muted-foreground">{rx.medications.length} medications</span>
                  </div>
                  {rx.medications.map((m, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      {m.name} — {m.dosage}, {m.frequency}
                    </p>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
