import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockReminders, mockAppointments } from '@/lib/mock-data';
import { Bell, Send } from 'lucide-react';
import type { ReminderStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusColors: Record<ReminderStatus, string> = {
  sent: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function ReminderManagement() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reminders</h1>
            <p className="text-sm text-muted-foreground">Manage appointment reminders</p>
          </div>
          <Button>
            <Send className="h-4 w-4 mr-1" /> Bulk Send
          </Button>
        </div>

        <Card className="border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Appointment Time</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReminders.map(r => {
                  const appt = mockAppointments.find(a => a.id === r.appointment_id);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm font-medium">{appt?.patient?.profile?.full_name || '—'}</TableCell>
                      <TableCell className="text-sm">{appt?.time_slot?.start_time || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{r.channel}</Badge>
                      </TableCell>
                      <TableCell className="text-sm capitalize">{r.language}</TableCell>
                      <TableCell>
                        <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize', statusColors[r.status])}>
                          {r.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" disabled={r.status === 'sent'}>
                          <Bell className="h-3.5 w-3.5 mr-1" /> Send
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
