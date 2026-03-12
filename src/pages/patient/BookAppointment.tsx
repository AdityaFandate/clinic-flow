import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TimeSlotPill } from '@/components/shared/TimeSlotPill';
import { Calendar } from '@/components/ui/calendar';
import { mockDoctors, mockTimeSlots } from '@/lib/mock-data';
import { AlertCircle, Check } from 'lucide-react';
import type { Language } from '@/types';

export default function BookAppointment() {
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [language, setLanguage] = useState<Language>('english');
  const [showConflict, setShowConflict] = useState(false);
  const [booked, setBooked] = useState(false);

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setShowConflict(true);
      return;
    }
    setBooked(true);
  };

  if (booked) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <Check className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Appointment Booked!</h2>
          <p className="text-muted-foreground mb-6">Your appointment has been confirmed successfully.</p>
          <Button onClick={() => setBooked(false)}>Book Another</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Book Appointment</h1>
          <p className="text-sm text-muted-foreground">Select a doctor, date, and available time slot</p>
        </div>

        <form onSubmit={handleBook}>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Form Fields */}
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Patient Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Patient Name</Label>
                      <Input placeholder="Full name" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Mobile Number</Label>
                      <Input placeholder="+91 XXXXX XXXXX" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Doctor</Label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDoctors.map(d => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.profile?.full_name} — {d.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Reason for Visit</Label>
                    <Textarea placeholder="Brief description of symptoms or reason" />
                  </div>

                  <div className="space-y-2">
                    <Label>Language Preference</Label>
                    <div className="flex gap-2">
                      {(['english', 'hindi', 'marathi'] as Language[]).map(lang => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setLanguage(lang)}
                          className={`rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-all ${
                            language === lang
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Slots */}
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Available Time Slots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {mockTimeSlots.map(slot => (
                      <TimeSlotPill
                        key={slot.id}
                        time={slot.start_time}
                        status={slot.status}
                        selected={selectedSlot === slot.id}
                        onClick={() => {
                          setSelectedSlot(slot.id);
                          setShowConflict(false);
                        }}
                      />
                    ))}
                  </div>
                  {showConflict && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Please select an available time slot to proceed.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button type="submit" className="w-full sm:w-auto" size="lg">
                Confirm Booking
              </Button>
            </div>

            {/* Calendar */}
            <Card className="border-border h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md"
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
