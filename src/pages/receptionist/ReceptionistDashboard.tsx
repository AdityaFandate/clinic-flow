import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, XCircle, CheckCircle, Plus } from 'lucide-react';
import { mockAppointments } from '@/lib/mock-data';
import { Link } from 'react-router-dom';

export default function ReceptionistDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Receptionist Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage today's clinic schedule</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Today's Appointments" value={12} icon={Calendar} trend={{ value: 8, positive: true }} />
          <StatCard label="Pending Confirmations" value={4} icon={Clock} />
          <StatCard label="Cancellations" value={1} icon={XCircle} />
          <StatCard label="Available Slots" value={18} icon={CheckCircle} trend={{ value: 5, positive: true }} />
        </div>

        {/* Today's Schedule */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAppointments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm font-medium">{a.time_slot?.start_time}</TableCell>
                    <TableCell className="text-sm">{a.patient?.profile?.full_name}</TableCell>
                    <TableCell className="text-sm">{a.doctor?.profile?.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.reason}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Floating Quick Book Button */}
        <Button
          asChild
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <Link to="/receptionist/quick-book">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </div>
    </DashboardLayout>
  );
}
