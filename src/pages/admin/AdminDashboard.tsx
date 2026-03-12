import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Stethoscope, BarChart3, CheckCircle, Trash2 } from 'lucide-react';
import { mockDoctors, mockPatients } from '@/lib/mock-data';

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">Clinic-wide overview and management</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Appointments" value={248} icon={Calendar} trend={{ value: 12, positive: true }} />
          <StatCard label="Active Doctors" value={3} icon={Stethoscope} />
          <StatCard label="Total Patients" value={156} icon={Users} trend={{ value: 8, positive: true }} />
          <StatCard label="Reminder Success" value="94%" icon={CheckCircle} trend={{ value: 3, positive: true }} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Doctors */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Doctors</CardTitle>
                <Button size="sm" variant="outline">Add Doctor</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDoctors.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="text-sm font-medium">{d.profile?.full_name}</TableCell>
                      <TableCell><Badge variant="secondary">{d.specialization}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Patients</CardTitle>
                <Button size="sm" variant="outline">View All</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPatients.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm font-medium">{p.profile?.full_name}</TableCell>
                      <TableCell className="text-sm">{p.age}y</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.profile?.phone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* System Logs */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { action: 'New appointment booked', time: '2 minutes ago', user: 'Receptionist' },
              { action: 'Patient registered', time: '15 minutes ago', user: 'System' },
              { action: 'Reminder sent (WhatsApp)', time: '1 hour ago', user: 'Automation' },
              { action: 'Prescription issued', time: '2 hours ago', user: 'Dr. Anika Sharma' },
              { action: 'Appointment cancelled', time: '3 hours ago', user: 'Patient' },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm text-foreground">{log.action}</p>
                  <p className="text-xs text-muted-foreground">{log.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{log.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
