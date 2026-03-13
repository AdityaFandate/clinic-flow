import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TimeSlotPill } from '@/components/shared/TimeSlotPill';
import {
  Calendar, Clock, Users, Bell, Plus, Search, UserCheck, XCircle,
  AlertCircle, Stethoscope, Activity, Check, X, RefreshCw, AlertTriangle,
  Phone, Siren, MessageCircle, MessageSquare,
} from 'lucide-react';
import { useAppointmentStore } from '@/stores/appointmentStore';
import type { Appointment, AppointmentStatus, TimeSlot, Language, Reminder } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ────────────────────────────────────────────────────────────────
// Types & helpers
// ────────────────────────────────────────────────────────────────
type FilterStatus = 'all' | AppointmentStatus;

interface BookForm {
  patientName: string;
  phone: string;
  doctorId: string;
  slotId: string;
  reason: string;
  language: Language;
  isEmergency: boolean;
}

const emptyBookForm: BookForm = {
  patientName: '', phone: '', doctorId: '', slotId: '',
  reason: '', language: 'english', isEmergency: false,
};

function uid() { return 'a' + Math.random().toString(36).slice(2, 9); }

// ────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────
export default function ReceptionistDashboard() {
  // ── store ──
  const { 
    appointments, 
    reminders, 
    doctors, 
    timeSlots,
    confirmAppointment, 
    cancelAppointment, 
    rescheduleAppointment,
    addAppointment,
    addReminder,
    updateReminder
  } = useAppointmentStore();

  // ── state ──
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  // modals
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookForm, setBookForm] = useState<BookForm>({ ...emptyBookForm });
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [previewReminder, setPreviewReminder] = useState<{ appt: Appointment, channel: 'whatsapp' | 'sms' } | null>(null);

  // ── Voice command listener ──
  useEffect(() => {
    function handleVoiceAction(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (!detail?.type) return;

      if (detail.type === 'book_appointment') {
        // Try to match doctor name to a mock doctor
        let matchedDoctorId = '';
        if (detail.doctor_name) {
          const docNameLower = detail.doctor_name.toLowerCase();
          const match = doctors.find(d =>
            (d.profile?.full_name || '').toLowerCase().includes(docNameLower)
          );
          if (match) matchedDoctorId = match.id;
        }

        setBookForm({
          patientName: detail.patient_name || '',
          phone: detail.phone || '',
          doctorId: matchedDoctorId,
          slotId: '',
          reason: detail.reason || '',
          language: 'english',
          isEmergency: false,
        });
        setShowBookModal(true);
        toast.info('🎤 Voice command: Opening booking form...');
      } else if (detail.type === 'cancel_appointment') {
        toast.info('🎤 Voice command: Please select the appointment to cancel from the table.');
      } else if (detail.type === 'reschedule_appointment') {
        toast.info('🎤 Voice command: Please select the appointment to reschedule from the table.');
      }
    }

    window.addEventListener('clinic:voice-action', handleVoiceAction);
    return () => window.removeEventListener('clinic:voice-action', handleVoiceAction);
  }, []);

  // ── derived ──
  const stats = useMemo(() => ({
    total:     appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    pendingReminders: reminders.filter(r => r.status === 'pending').length,
  }), [appointments, reminders]);

  const filtered = useMemo(() => {
    return appointments
      .filter(a => filter === 'all' || a.status === filter)
      .filter(a => {
        const q = search.toLowerCase();
        if (!q) return true;
        return (
          (a.patient?.profile?.full_name || '').toLowerCase().includes(q) ||
          (a.doctor?.profile?.full_name || '').toLowerCase().includes(q) ||
          (a.reason || '').toLowerCase().includes(q)
        );
      });
  }, [appointments, filter, search]);

  const bookedSlotIds = useMemo(
    () => new Set(appointments.filter(a => a.status !== 'cancelled').map(a => a.slot_id)),
    [appointments]
  );

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // ── actions ──
  function handleConfirm(id: string) {
    confirmAppointment(id);
    toast.success('Appointment confirmed');
  }

  function handleCancel(id: string) {
    cancelAppointment(id);
    setCancelTarget(null);
    toast.success('Appointment cancelled — patient will be notified');
  }

  function handleReschedule() {
    if (!rescheduleTarget || !rescheduleSlot) return;
    const newSlot = timeSlots.find(s => s.id === rescheduleSlot);
    if (!newSlot) return;
    rescheduleAppointment(rescheduleTarget.id, rescheduleSlot, newSlot);
    setRescheduleTarget(null);
    setRescheduleSlot('');
    toast.success('Appointment rescheduled to ' + (newSlot?.start_time || ''));
  }

  // Multilingual reminder message generator
  function getReminderMsg(a: Appointment): string {
    const name = a.patient?.profile?.full_name || 'Patient';
    const doc = a.doctor?.profile?.full_name || 'Doctor';
    const time = a.time_slot?.start_time || '';
    const date = a.time_slot?.date || 'today';

    if (a.language === 'hindi') {
      return `नमस्ते ${name} जी, यह ClinicOS से अपॉइंटमेंट रिमाइंडर है। आपकी अपॉइंटमेंट ${doc} के साथ ${date} को ${time} बजे है। कृपया समय पर पहुँचें। धन्यवाद!`;
    }
    if (a.language === 'marathi') {
      return `नमस्कार ${name}, हा ClinicOS कडून अपॉइंटमेंट रिमाइंडर आहे. तुमची अपॉइंटमेंट ${doc} यांच्यासोबत ${date} रोजी ${time} वाजता आहे. कृपया वेळेवर या. धन्यवाद!`;
    }
    return `Hi ${name}, this is a reminder from ClinicOS. Your appointment with ${doc} is on ${date} at ${time}. Please arrive 10 minutes early. Thank you!`;
  }

  function handleSimulateSend() {
    if (!previewReminder) return;
    const { appt: a, channel } = previewReminder;
    
    // Mark reminder as sent in local state
    const existing = reminders.find(r => r.appointment_id === a.id);
    if (existing) {
      updateReminder(existing.id, { status: 'sent', channel: channel as any, sent_at: new Date().toISOString() });
    } else {
      addReminder({
        id: 'r' + Math.random().toString(36).slice(2, 9),
        appointment_id: a.id,
        channel: channel as any,
        language: a.language as any,
        status: 'sent' as any,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    }
    toast.success(`Simulated ${channel.toUpperCase()} sent successfully!`);
    setPreviewReminder(null);
  }

  function handleSendReminder(a: Appointment, channel: 'whatsapp' | 'sms') {
    setPreviewReminder({ appt: a, channel });
  }

  function handleBook() {
    if (!bookForm.patientName || !bookForm.doctorId || !bookForm.slotId) {
      toast.error('Please fill all required fields');
      return;
    }

    const selectedSlot = timeSlots.find(s => s.id === bookForm.slotId);
    const selectedDoctor = doctors.find(d => d.id === bookForm.doctorId);

    // Emergency: auto-reschedule the conflicting appointment
    if (bookForm.isEmergency && bookedSlotIds.has(bookForm.slotId)) {
      const conflicting = appointments.find(a => a.slot_id === bookForm.slotId && a.status !== 'cancelled');
      if (conflicting) {
        // Find next available slot for the same doctor
        const nextFree = timeSlots.find(s =>
          !bookedSlotIds.has(s.id) && s.doctor_id === conflicting.doctor_id && s.status === 'available'
        );
        if (nextFree) {
          rescheduleAppointment(conflicting.id, nextFree.id, nextFree);
          toast.info(`⚠️ ${conflicting.patient?.profile?.full_name || 'Patient'} auto-rescheduled to ${nextFree.start_time}`);
        } else {
          toast.error('No available slot to reschedule the conflicting patient');
          return;
        }
      }
    }

    const newAppt: Appointment = {
      id: uid(),
      patient_id: '',
      doctor_id: bookForm.doctorId,
      slot_id: bookForm.slotId,
      status: bookForm.isEmergency ? 'confirmed' : 'scheduled',
      reason: bookForm.isEmergency ? `🚨 EMERGENCY: ${bookForm.reason || 'Urgent'}` : bookForm.reason,
      language: bookForm.language,
      created_at: new Date().toISOString(),
      patient: { id: '', user_id: '', profile: { id: '', user_id: '', full_name: bookForm.patientName, phone: bookForm.phone, language_pref: bookForm.language, created_at: '' } },
      doctor: selectedDoctor,
      time_slot: selectedSlot,
    };

    addAppointment(newAppt);
    setShowBookModal(false);
    setBookForm({ ...emptyBookForm });
    toast.success(bookForm.isEmergency ? '🚨 Emergency appointment booked!' : 'Appointment booked successfully');
  }

  // ────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reception Dashboard</h1>
            <p className="text-sm text-muted-foreground">{todayStr}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/receptionist/reminders">
                <Bell className="h-4 w-4 mr-1.5" /> Reminders
                {stats.pendingReminders > 0 && (
                  <span className="ml-1.5 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
                    {stats.pendingReminders}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="destructive" onClick={() => { setBookForm({ ...emptyBookForm, isEmergency: true }); setShowBookModal(true); }}>
              <Siren className="h-4 w-4 mr-1" /> Emergency
            </Button>
            <Button onClick={() => { setBookForm({ ...emptyBookForm }); setShowBookModal(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Book Appointment
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Today" value={stats.total} icon={Calendar} trend={{ value: 8, positive: true }} />
          <StatCard label="Confirmed" value={stats.confirmed} icon={UserCheck} trend={{ value: 12, positive: true }} />
          <StatCard label="Scheduled" value={stats.scheduled} icon={Clock} />
          <StatCard label="Cancelled" value={stats.cancelled} icon={XCircle} />
        </div>

        {/* Filter + Search Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(['all', 'confirmed', 'scheduled', 'completed', 'cancelled'] as FilterStatus[]).map(f => (
              <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="text-xs capitalize">
                {f === 'all' ? 'All' : f}
              </Button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patient, doctor…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>

        {/* ─── TODAY'S SCHEDULE TABLE ─── */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" /> Today's Schedule
              <span className="ml-auto text-sm font-normal text-muted-foreground">{filtered.length} appointment{filtered.length !== 1 ? 's' : ''}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {['Time', 'Patient', 'Doctor', 'Reason', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      <AlertCircle className="h-5 w-5 mx-auto mb-2 opacity-50" /> No appointments found
                    </td></tr>
                  ) : filtered.map(a => {
                    const reminderStatus = reminders.find(r => r.appointment_id === a.id)?.status;
                    const isEmergency = (a.reason || '').startsWith('🚨');
                    return (
                      <tr key={a.id} className={cn('hover:bg-muted/30 transition-colors', isEmergency && 'bg-destructive/5')}>
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            {a.time_slot?.start_time || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{a.patient?.profile?.full_name || '—'}</div>
                          <div className="text-xs text-muted-foreground">{a.patient?.profile?.phone || ''}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                              <Stethoscope className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-foreground">{a.doctor?.profile?.full_name || '—'}</div>
                              <div className="text-xs text-muted-foreground">{a.doctor?.specialization || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                          {isEmergency && <AlertTriangle className="h-3.5 w-3.5 text-destructive inline mr-1" />}
                          {a.reason || '—'}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {a.status === 'scheduled' && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-success hover:text-success" onClick={() => handleConfirm(a.id)}>
                                <Check className="h-3 w-3 mr-1" /> Confirm
                              </Button>
                            )}
                            {a.status !== 'cancelled' && a.status !== 'completed' && (
                              <>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setRescheduleTarget(a); setRescheduleSlot(''); }}>
                                  <RefreshCw className="h-3 w-3 mr-1" /> Reschedule
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => setCancelTarget(a)}>
                                  <X className="h-3 w-3 mr-1" /> Cancel
                                </Button>
                              </>
                            )}
                            {a.status !== 'cancelled' && (
                              <>
                                <Button
                                  size="sm" variant="ghost"
                                  className={cn('h-7 text-xs text-green-600 hover:text-green-700', reminderStatus === 'sent' && 'opacity-50')}
                                  disabled={reminderStatus === 'sent'}
                                  onClick={() => handleSendReminder(a, 'whatsapp')}
                                  title="Send via WhatsApp"
                                >
                                  <MessageCircle className="h-3 w-3 mr-1" /> WA
                                </Button>
                                <Button
                                  size="sm" variant="ghost"
                                  className={cn('h-7 text-xs', reminderStatus === 'sent' && 'opacity-50')}
                                  disabled={reminderStatus === 'sent'}
                                  onClick={() => handleSendReminder(a, 'sms')}
                                  title="Send via SMS"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" /> SMS
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ─── DOCTOR LOAD ─── */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" /> Doctor Load Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map(doc => {
                const count = appointments.filter(a => a.doctor_id === doc.id && a.status !== 'cancelled').length;
                const maxSlots = 8;
                const pct = Math.min(100, Math.round((count / maxSlots) * 100));
                return (
                  <div key={doc.id} className="rounded-lg border border-border p-4 bg-muted/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Stethoscope className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{doc.profile?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{doc.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>{count} appt{count !== 1 ? 's' : ''}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all duration-500', pct > 80 ? 'bg-destructive' : pct > 50 ? 'bg-warning' : 'bg-primary')} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           MODALS
         ═══════════════════════════════════════════════════════════ */}

      {/* ── BOOK / EMERGENCY MODAL ── */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowBookModal(false)}>
          <div className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  {bookForm.isEmergency && <Siren className="h-5 w-5 text-destructive" />}
                  {bookForm.isEmergency ? 'Emergency Booking' : 'Book New Appointment'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {bookForm.isEmergency
                    ? 'This will auto-reschedule any conflicting appointment'
                    : 'Select doctor and available time slot'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowBookModal(false)}><X className="h-4 w-4" /></Button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Patient Name *</Label>
                  <Input placeholder="Full name" value={bookForm.patientName} onChange={e => setBookForm(f => ({ ...f, patientName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+91 XXXXX XXXXX" value={bookForm.phone} onChange={e => setBookForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Doctor *</Label>
                <Select value={bookForm.doctorId} onValueChange={v => setBookForm(f => ({ ...f, doctorId: v, slotId: '' }))}>
                  <SelectTrigger><SelectValue placeholder="Select a doctor" /></SelectTrigger>
                  <SelectContent>
                    {doctors.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.profile?.full_name} — {d.specialization}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reason for Visit</Label>
                <Textarea placeholder="Symptoms or reason" value={bookForm.reason} onChange={e => setBookForm(f => ({ ...f, reason: e.target.value }))} className="h-20" />
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <div className="flex gap-2">
                  {(['english', 'hindi', 'marathi'] as Language[]).map(lang => (
                    <button key={lang} type="button" onClick={() => setBookForm(f => ({ ...f, language: lang }))}
                      className={cn('rounded-full border px-4 py-1.5 text-sm font-medium capitalize transition-all',
                        bookForm.language === lang ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'
                      )}>{lang}</button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              {bookForm.doctorId && (
                <div className="space-y-2">
                  <Label>Available Time Slots *</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.filter(s => s.doctor_id === bookForm.doctorId).map(slot => {
                      const isBooked = bookedSlotIds.has(slot.id);
                      const isSelected = bookForm.slotId === slot.id;
                      const canSelectBooked = bookForm.isEmergency && isBooked;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isBooked && !bookForm.isEmergency}
                          onClick={() => setBookForm(f => ({ ...f, slotId: slot.id }))}
                          className={cn(
                            'rounded-lg border px-3 py-2 text-xs font-medium transition-all text-center',
                            isSelected ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/30' :
                            canSelectBooked ? 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20 cursor-pointer' :
                            isBooked ? 'bg-muted text-muted-foreground/50 border-border cursor-not-allowed line-through' :
                            slot.status === 'blocked' ? 'bg-muted text-muted-foreground/50 border-border cursor-not-allowed' :
                            'bg-card text-foreground border-border hover:border-primary/50 cursor-pointer'
                          )}
                        >
                          {slot.start_time}
                          {canSelectBooked && !isSelected && <span className="block text-[9px]">⚠️ occupied</span>}
                        </button>
                      );
                    })}
                  </div>
                  {bookForm.isEmergency && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3" /> Red slots are occupied — selecting one will auto-reschedule the existing patient
                    </p>
                  )}
                  {!bookForm.isEmergency && bookedSlotIds.has(bookForm.slotId) && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> This slot is already booked — clash detected!
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowBookModal(false)}>Cancel</Button>
                <Button
                  className={cn('flex-[2]', bookForm.isEmergency && 'bg-destructive hover:bg-destructive/90')}
                  onClick={handleBook}
                >
                  {bookForm.isEmergency ? '🚨 Book Emergency' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESCHEDULE MODAL ── */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setRescheduleTarget(null)}>
          <div className="w-full max-w-md mx-4 rounded-xl border border-border bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Reschedule Appointment</h2>
                <p className="text-xs text-muted-foreground">
                  {rescheduleTarget.patient?.profile?.full_name} · Currently at {rescheduleTarget.time_slot?.start_time}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setRescheduleTarget(null)}><X className="h-4 w-4" /></Button>
            </div>

            <div className="space-y-3">
              <Label>Select New Time Slot</Label>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots
                  .filter(s => s.doctor_id === rescheduleTarget.doctor_id)
                  .map(slot => {
                    const isBooked = bookedSlotIds.has(slot.id) && slot.id !== rescheduleTarget.slot_id;
                    const isSelected = rescheduleSlot === slot.id;
                    const isCurrent = slot.id === rescheduleTarget.slot_id;
                    return (
                      <button key={slot.id} type="button" disabled={isBooked || slot.status === 'blocked'}
                        onClick={() => setRescheduleSlot(slot.id)}
                        className={cn(
                          'rounded-lg border px-3 py-2 text-xs font-medium transition-all text-center',
                          isSelected ? 'bg-primary text-primary-foreground border-primary ring-2 ring-primary/30' :
                          isCurrent ? 'bg-warning/20 text-warning border-warning/40' :
                          isBooked ? 'bg-muted text-muted-foreground/50 border-border cursor-not-allowed line-through' :
                          'bg-card text-foreground border-border hover:border-primary/50 cursor-pointer'
                        )}
                      >
                        {slot.start_time}
                        {isCurrent && <span className="block text-[9px]">current</span>}
                      </button>
                    );
                  })}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setRescheduleTarget(null)}>Cancel</Button>
                <Button className="flex-[2]" disabled={!rescheduleSlot} onClick={handleReschedule}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reschedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CANCEL CONFIRMATION ── */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setCancelTarget(null)}>
          <div className="w-full max-w-sm mx-4 rounded-xl border border-border bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Cancel Appointment</h2>
                <p className="text-xs text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Are you sure you want to cancel <span className="font-medium text-foreground">{cancelTarget.patient?.profile?.full_name}</span>'s appointment at <span className="font-medium text-foreground">{cancelTarget.time_slot?.start_time}</span>? The patient will be notified.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setCancelTarget(null)}>Keep</Button>
              <Button variant="destructive" className="flex-1" onClick={() => handleCancel(cancelTarget.id)}>
                <X className="h-3.5 w-3.5 mr-1" /> Cancel Appointment
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Simulated Message Preview Modal */}
      {previewReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4" onClick={() => setPreviewReminder(null)}>
          <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden border border-border flex flex-col" onClick={e => e.stopPropagation()}>
            <div className={cn("px-4 py-3 flex text-white items-center justify-between", previewReminder.channel === 'whatsapp' ? 'bg-[#128C7E]' : 'bg-primary')}>
              <div className="flex items-center gap-2">
                {previewReminder.channel === 'whatsapp' ? <MessageCircle className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
                <span className="font-medium text-sm">Message Preview • {previewReminder.channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setPreviewReminder(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 bg-muted/30">
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Phone className="h-3 w-3" /> Sending to: <span className="font-medium text-foreground">{previewReminder.appt.patient?.profile?.phone}</span>
              </div>
              <div className={cn("p-4 rounded-xl text-sm whitespace-pre-wrap relative", previewReminder.channel === 'whatsapp' ? 'bg-[#DCF8C6] text-[#075E54]' : 'bg-primary text-primary-foreground')}>
                {getReminderMsg(previewReminder.appt)}
                <div className={cn("absolute bottom-2 right-2 text-[10px]", previewReminder.channel === 'whatsapp' ? 'text-black/40' : 'text-white/60')}>
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPreviewReminder(null)}>Cancel</Button>
              <Button onClick={handleSimulateSend} className={cn("flex-1 text-white", previewReminder.channel === 'whatsapp' ? 'bg-[#128C7E] hover:bg-[#075e54]' : 'bg-primary')}>
                Simulate Send {previewReminder.channel === 'whatsapp' ? 'WA' : 'SMS'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}