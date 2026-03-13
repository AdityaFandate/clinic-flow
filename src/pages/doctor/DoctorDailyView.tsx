import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppointmentCard } from '@/components/shared/AppointmentCard';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockAppointments } from '@/lib/mock-data';
import { List, Clock } from 'lucide-react';

export default function DoctorDailyView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'list' | 'timeline'>('timeline');

  const timelineHours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Daily View</h1>
            <p className="text-sm text-muted-foreground">Your appointments for today</p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4 mr-1" /> List
            </Button>
            <Button
              variant={view === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('timeline')}
            >
              <Clock className="h-4 w-4 mr-1" /> Timeline
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Mini Calendar */}
          <Card className="border-border h-fit">
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          {/* Appointments */}
          <div>
            {view === 'list' ? (
              <div className="space-y-3">
                {mockAppointments.map(a => (
                  <AppointmentCard key={a.id} appointment={a} />
                ))}
              </div>
            ) : (
              <div className="space-y-0">
                {timelineHours.map(hour => {
                  const hourAppts = mockAppointments.filter(
                    a => a.time_slot?.start_time?.startsWith(hour.split(':')[0])
                  );
                  return (
                    <div key={hour} className="flex gap-4 border-l-2 border-border py-3 pl-6 relative">
                      <div className="absolute -left-2 top-3 h-4 w-4 rounded-full border-2 border-border bg-card" />
                      <span className="w-14 shrink-0 text-sm font-medium text-muted-foreground">{hour}</span>
                      <div className="flex-1 space-y-2">
                        {hourAppts.length > 0 ? (
                          hourAppts.map(a => <AppointmentCard key={a.id} appointment={a} />)
                        ) : (
                          <div className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                            No appointments
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
