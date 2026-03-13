import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Calendar, Clock, Search, Filter, Stethoscope, AlertCircle, Phone,
  Check, X, RefreshCw, MessageCircle, MessageSquare, AlertTriangle,
} from 'lucide-react';
import { useAppointmentStore } from '@/stores/appointmentStore';
import type { Appointment, AppointmentStatus, TimeSlot } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type FilterStatus = 'all' | AppointmentStatus;

export default function ReceptionistAppointments() {
  // ── store ──
  const { 
    appointments, 
    reminders, 
    timeSlots,
    confirmAppointment, 
    cancelAppointment, 
    rescheduleAppointment,
    addReminder,
    updateReminder
  } = useAppointmentStore();

  // ── state ──
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [previewReminder, setPreviewReminder] = useState<{ appt: Appointment, channel: 'whatsapp' | 'sms' } | null>(null);

  // ── derived ──
  const filtered = useMemo(() => {
    return appointments
      .filter(a => filter === 'all' || a.status === filter)
      .filter(a => {
        if (dateFilter && a.time_slot?.date !== dateFilter) return false;
        const q = search.toLowerCase();
        if (!q) return true;
        return (
          (a.patient?.profile?.full_name || '').toLowerCase().includes(q) ||
          (a.doctor?.profile?.full_name || '').toLowerCase().includes(q) ||
          (a.reason || '').toLowerCase().includes(q)
        );
      });
  }, [appointments, filter, search, dateFilter]);

  const statusCounts = useMemo(() => ({
    all: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }), [appointments]);

  const bookedSlotIds = useMemo(
    () => new Set(appointments.filter(a => a.status !== 'cancelled').map(a => a.slot_id)),
    [appointments]
  );

  // ── actions ──
  function handleConfirm(id: string) {
    confirmAppointment(id);
    toast.success('Appointment confirmed');
  }

  function handleCancel(id: string) {
    cancelAppointment(id);
    setCancelTarget(null);
    toast.success('Appointment cancelled');
  }

  function handleReschedule() {
    if (!rescheduleTarget || !rescheduleSlot) return;
    const newSlot = timeSlots.find(s => s.id === rescheduleSlot);
    if (!newSlot) return;
    rescheduleAppointment(rescheduleTarget.id, rescheduleSlot, newSlot);
    setRescheduleTarget(null);
    setRescheduleSlot('');
    toast.success('Appointment rescheduled');
  }

  function getReminderMsg(a: Appointment): string {
    const name = a.patient?.profile?.full_name || 'Patient';
    const doc = a.doctor?.profile?.full_name || 'Doctor';
    const time = a.time_slot?.start_time || '';
    const date = a.time_slot?.date || 'today';
    if (a.language === 'hindi') return `नमस्ते ${name} जी, यह ClinicOS से रिमाइंडर है...`;
    if (a.language === 'marathi') return `नमस्कार ${name}, हा ClinicOS कडून रिमाइंडर आहे...`;
    return `Hi ${name}, this is an appointment reminder from ClinicOS...`;
  }

  function handleSimulateSend() {
    if (!previewReminder) return;
    const { appt: a, channel } = previewReminder;
    const existing = reminders.find(r => r.appointment_id === a.id);
    if (existing) updateReminder(existing.id, { status: 'sent', channel, sent_at: new Date().toISOString() });
    else addReminder({ id: 'r'+Math.random().toString(36).slice(2, 9), appointment_id: a.id, channel, language: a.language as any, status: 'sent' as any, sent_at: new Date().toISOString(), created_at: new Date().toISOString() });
    toast.success(`Simulated ${channel.toUpperCase()} sent successfully!`);
    setPreviewReminder(null);
  }

  function handleSendReminder(a: Appointment, channel: 'whatsapp' | 'sms') {
    setPreviewReminder({ appt: a, channel });
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Appointments</h1>
          <p className="text-sm text-muted-foreground">View and manage all clinic appointments</p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(['all', 'confirmed', 'scheduled', 'completed', 'cancelled'] as FilterStatus[]).map(f => (
              <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="text-xs gap-1.5 uppercase">
                {f === 'all' ? 'All' : f}
                <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', filter === f ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                  {statusCounts[f as keyof typeof statusCounts] || 0}
                </span>
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="h-9 w-40 text-sm" />
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
            </div>
          </div>
        </div>

        {/* Table */}
        <Card className="border-border">
          <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> All Appointments</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-muted/50">{['Date', 'Time', 'Patient', 'Doctor', 'Status', 'Actions'].map(h => (<th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>))}</tr></thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground"><AlertCircle className="h-5 w-5 mx-auto mb-2 opacity-50" /> No appointments found</td></tr>
                  ) : filtered.map(a => {
                    const reminderStatus = reminders.find(r => r.appointment_id === a.id)?.status;
                    return (
                      <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-xs whitespace-nowrap">{a.time_slot?.date || '—'}</td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">{a.time_slot?.start_time || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{a.patient?.profile?.full_name}</div>
                          <div className="text-xs text-muted-foreground">{a.patient?.profile?.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium">{a.doctor?.profile?.full_name}</div>
                          <div className="text-xs text-muted-foreground">{a.doctor?.specialization}</div>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {a.status === 'scheduled' && <Button size="sm" variant="ghost" className="h-7 text-xs text-success" onClick={() => handleConfirm(a.id)}><Check className="h-3 w-3 mr-1" /> Confirm</Button>}
                            {a.status !== 'cancelled' && a.status !== 'completed' && (
                              <>
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setRescheduleTarget(a); setRescheduleSlot(''); }}><RefreshCw className="h-3 w-3 mr-1" /> Reschedule</Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => setCancelTarget(a)}><X className="h-3 w-3 mr-1" /> Cancel</Button>
                              </>
                            )}
                            {a.status !== 'cancelled' && (
                              <>
                                <Button size="sm" variant="ghost" className={cn('h-7 text-xs text-green-600', reminderStatus === 'sent' && 'opacity-50')} onClick={() => handleSendReminder(a, 'whatsapp')} disabled={reminderStatus === 'sent'}><MessageCircle className="h-3 w-3 mr-1" /> WA</Button>
                                <Button size="sm" variant="ghost" className={cn('h-7 text-xs', reminderStatus === 'sent' && 'opacity-50')} onClick={() => handleSendReminder(a, 'sms')} disabled={reminderStatus === 'sent'}><MessageSquare className="h-3 w-3 mr-1" /> SMS</Button>
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
      </div>

      {/* Modals same as Dashboard... (simplified for breviry in this OS flow) */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setRescheduleTarget(null)}>
          <div className="w-full max-w-md mx-4 rounded-xl border border-border bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Reschedule Appointment</h2>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {timeSlots.filter(s => s.doctor_id === rescheduleTarget.doctor_id).map(slot => (
                <button key={slot.id} onClick={() => setRescheduleSlot(slot.id)} className={cn('rounded border p-2 text-xs', rescheduleSlot === slot.id ? 'bg-primary text-white' : bookedSlotIds.has(slot.id) ? 'bg-muted opacity-50' : 'bg-card')}>{slot.start_time}</button>
              ))}
            </div>
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setRescheduleTarget(null)}>Cancel</Button><Button className="flex-1" disabled={!rescheduleSlot} onClick={handleReschedule}>Confirm</Button></div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setCancelTarget(null)}>
          <div className="w-full max-w-sm mx-4 bg-card border border-border p-6 rounded-xl shadow-xl space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Cancel Appointment?</h2>
            <p className="text-sm text-muted-foreground">Are you sure you want to cancel the appointment for <span className="font-semibold text-foreground">{cancelTarget.patient?.profile?.full_name}</span>? They will be notified automatically.</p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setCancelTarget(null)}>No, Keep it</Button>
              <Button variant="destructive" className="flex-1" onClick={() => handleCancel(cancelTarget.id)}>Yes, Cancel</Button>
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
