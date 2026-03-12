import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { mockPatients, mockAppointments, mockPrescriptions } from '@/lib/mock-data';

export default function PatientProfile() {
  const patient = mockPatients[0];
  const name = patient.profile?.full_name || 'Unknown';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const patientAppts = mockAppointments.filter(a => a.patient_id === patient.id);
  const patientRx = mockPrescriptions.filter(rx => rx.patient_id === patient.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="border-border">
          <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-semibold text-foreground">{name}</h1>
              <div className="mt-2 flex flex-wrap gap-3 justify-center sm:justify-start">
                <Badge variant="secondary">{patient.age}y, {patient.gender}</Badge>
                <Badge variant="secondary">Blood: {patient.blood_group}</Badge>
                <Badge variant="outline">{patient.profile?.phone}</Badge>
                <Badge variant="outline" className="capitalize">{patient.profile?.language_pref}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-3 mt-4">
            {patientAppts.filter(a => a.status === 'confirmed' || a.status === 'scheduled').map(a => (
              <Card key={a.id} className="border-border">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.doctor?.profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{a.time_slot?.date} · {a.time_slot?.start_time}</p>
                    <p className="text-xs text-muted-foreground">{a.reason}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history" className="space-y-3 mt-4">
            {patientAppts.filter(a => a.status === 'completed' || a.status === 'cancelled').map(a => (
              <Card key={a.id} className="border-border">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.doctor?.profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{a.time_slot?.date} · {a.time_slot?.start_time}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-3 mt-4">
            {patientRx.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No prescriptions found</p>
            ) : (
              patientRx.map(rx => (
                <Card key={rx.id} className="border-border">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-foreground mb-2">{rx.created_at}</p>
                    {rx.medications.map((m, i) => (
                      <p key={i} className="text-xs text-muted-foreground">{m.name} — {m.dosage}, {m.frequency}, {m.duration}</p>
                    ))}
                    {rx.notes && <p className="text-xs text-muted-foreground mt-2 italic">{rx.notes}</p>}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Card className="border-border">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-muted-foreground">No clinical notes yet</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
