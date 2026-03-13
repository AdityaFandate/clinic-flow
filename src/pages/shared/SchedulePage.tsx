import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { mockAppointments } from '@/lib/mock-data';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

export default function SchedulePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Schedule</h1>
          <p className="text-sm text-muted-foreground">Manage and view appointments</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" className="rounded-md border" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline View</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockAppointments.length > 0 ? (
                mockAppointments.map((apt) => (
                  <div key={apt.id} className="flex gap-4 p-3 rounded-lg border border-border bg-card hover:bg-accent transition-colors">
                    <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-border pr-4">
                      <span className="text-sm font-bold text-primary">{apt.time_slot?.start_time}</span>
                      <span className="text-xs text-muted-foreground">60m</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{apt.patient?.profile?.full_name}</span>
                        </div>
                        <Badge variant={apt.status === 'confirmed' ? 'default' : 'outline'}>{apt.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {apt.reason}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">No appointments scheduled for this day.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
