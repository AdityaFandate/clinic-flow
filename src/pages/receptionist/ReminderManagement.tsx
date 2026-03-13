import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bell, Send, Search, MessageCircle, MessageSquare,
  Phone, X, CheckCircle2, AlertCircle, Clock, RefreshCw,
  Filter, ChevronDown,
} from 'lucide-react';
import { useAppointmentStore } from '@/stores/appointmentStore';
import type { Appointment, ReminderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────
type Channel = 'whatsapp' | 'sms';
type FilterStatus = 'all' | ReminderStatus;

interface PreviewState {
  appt: Appointment;
  channel: Channel;
  reminderIndex: number; // index into reminders array
}

// ─── Multilingual message builder ────────────────────────────────────────────
function buildMessage(appt: Appointment, channel: Channel): string {
  const name   = appt.patient?.profile?.full_name  || 'Patient';
  const doc    = appt.doctor?.profile?.full_name    || 'Doctor';
  const time   = appt.time_slot?.start_time         || '—';
  const date   = appt.time_slot?.date               || 'today';
  const clinic = 'Riverside Clinic';
  const phone  = '(022) 1234-5678';

  const isWA = channel === 'whatsapp';

  if (appt.language === 'hindi') {
    return isWA
      ? `🏥 *${clinic}* — अपॉइंटमेंट रिमाइंडर\n\nनमस्ते *${name}* जी,\n\nआपकी अपॉइंटमेंट की जानकारी:\n📅 दिनांक: *${date}*\n⏰ समय: *${time}*\n👨‍⚕️ डॉक्टर: *${doc}*\n\nकृपया समय से 10 मिनट पहले पहुँचें।\nकोई जानकारी के लिए: ${phone}\n\n_धन्यवाद!_ 🙏`
      : `${clinic}: नमस्ते ${name} जी, आपकी अपॉइंटमेंट ${doc} के साथ ${date} को ${time} बजे है। समय पर पहुँचें। जानकारी: ${phone}`;
  }

  if (appt.language === 'marathi') {
    return isWA
      ? `🏥 *${clinic}* — अपॉइंटमेंट रिमाइंडर\n\nनमस्कार *${name}*,\n\nतुमच्या अपॉइंटमेंटची माहिती:\n📅 दिनांक: *${date}*\n⏰ वेळ: *${time}*\n👨‍⚕️ डॉक्टर: *${doc}*\n\nकृपया 10 मिनिटे आधी या.\nचौकशीसाठी: ${phone}\n\n_धन्यवाद!_ 🙏`
      : `${clinic}: नमस्कार ${name}, तुमची अपॉइंटमेंट ${doc} यांच्यासोबत ${date} रोजी ${time} वाजता आहे. वेळेवर या. संपर्क: ${phone}`;
  }

  // English (default)
  return isWA
    ? `🏥 *${clinic}* — Appointment Reminder\n\nHello *${name}*,\n\nYour appointment details:\n📅 Date: *${date}*\n⏰ Time: *${time}*\n👨‍⚕️ Doctor: *${doc}*\n\nPlease arrive 10 minutes early.\nQueries? Call us: ${phone}\n\n_Thank you!_ 😊`
    : `${clinic}: Hi ${name}, your appt with ${doc} is on ${date} at ${time}. Arrive 10 min early. Queries: ${phone}`;
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: ReminderStatus }) {
  const map = {
    sent:    { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Sent'    },
    pending: { cls: 'bg-amber-50   text-amber-700   border-amber-200',   icon: <Clock        className="h-3 w-3" />, label: 'Pending' },
    failed:  { cls: 'bg-red-50     text-red-700     border-red-200',     icon: <AlertCircle  className="h-3 w-3" />, label: 'Failed'  },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold', s.cls)}>
      {s.icon}{s.label}
    </span>
  );
}

// ─── Channel icon ─────────────────────────────────────────────────────────────
function ChannelBadge({ channel }: { channel: Channel }) {
  return channel === 'whatsapp'
    ? <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-700"><MessageCircle className="h-3 w-3" />WhatsApp</span>
    : <span className="inline-flex items-center gap-1 rounded-md bg-blue-50   border border-blue-200   px-2 py-0.5 text-xs font-medium text-blue-700">  <MessageSquare  className="h-3 w-3" />SMS</span>;
}

// ─── WhatsApp bubble ──────────────────────────────────────────────────────────
function WaBubble({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex justify-end">
      <div className="relative max-w-[85%] rounded-2xl rounded-tr-sm bg-[#dcf8c6] px-4 py-3 text-sm text-[#075e54] shadow-sm">
        <pre className="whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
        <div className="mt-1 flex items-center justify-end gap-1">
          <span className="text-[10px] text-[#075e54]/60">{time}</span>
          <svg className="h-3 w-3 text-[#4fc3f7]" viewBox="0 0 16 11" fill="currentColor"><path d="M11.071.653a.75.75 0 0 1 .01 1.06L6.34 6.74a.75.75 0 0 1-1.055.011L3.17 4.66a.75.75 0 0 1 1.045-1.076l1.6 1.556L10.01.663a.75.75 0 0 1 1.06-.01ZM14.65.653a.75.75 0 0 1 .01 1.06L6.34 9.74a.75.75 0 0 1-1.055.011L3.17 7.66a.75.75 0 0 1 1.045-1.076l1.6 1.556L13.59.663a.75.75 0 0 1 1.06-.01Z"/></svg>
        </div>
      </div>
    </div>
  );
}

// ─── SMS bubble ───────────────────────────────────────────────────────────────
function SmsBubble({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex justify-end">
      <div className="relative max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm text-primary-foreground shadow-sm">
        <pre className="whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
        <p className="mt-1 text-right text-[10px] text-primary-foreground/60">{time}</p>
      </div>
    </div>
  );
}

// ─── Preview Modal ────────────────────────────────────────────────────────────
function MessagePreviewModal({
  preview,
  onClose,
  onSend,
}: {
  preview: PreviewState;
  onClose: () => void;
  onSend: () => void;
}) {
  const { appt, channel } = preview;
  const msg  = buildMessage(appt, channel);
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isWA = channel === 'whatsapp';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* App header bar */}
        <div className={cn('flex items-center justify-between px-4 py-3 text-white', isWA ? 'bg-[#128c7e]' : 'bg-primary')}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              {(appt.patient?.profile?.full_name || 'P').charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{appt.patient?.profile?.full_name}</p>
              <p className="text-[11px] text-white/70 flex items-center gap-1">
                <Phone className="h-2.5 w-2.5" />{appt.patient?.profile?.phone || '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isWA ? <MessageCircle className="h-4 w-4 opacity-80" /> : <MessageSquare className="h-4 w-4 opacity-80" />}
            <button onClick={onClose} className="ml-2 rounded-full p-1 hover:bg-white/20">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat background */}
        <div
          className="flex-1 min-h-[240px] p-4 space-y-2 overflow-y-auto"
          style={{
            background: isWA
              ? 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 40L40 0H20L0 20M40 40V20L20 40\' fill=\'%23e8f5e9\' fill-opacity=\'0.4\'/%3E%3C/svg%3E") #e5ddd5'
              : '#f0f4f8',
          }}
        >
          {/* Date chip */}
          <div className="flex justify-center">
            <span className="rounded-full bg-black/10 px-3 py-0.5 text-[10px] text-gray-600">
              Today, {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          {isWA
            ? <WaBubble text={msg} time={time} />
            : <SmsBubble text={msg} time={time} />
          }
        </div>

        {/* Action bar */}
        <div className="border-t border-border bg-card px-4 py-3 space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            Preview only — click <span className="font-semibold text-foreground">Send</span> to simulate dispatch
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button
              className={cn('flex-[2] text-white font-semibold gap-1.5', isWA ? 'bg-[#128c7e] hover:bg-[#0e7063]' : '')}
              onClick={onSend}
            >
              <Send className="h-3.5 w-3.5" />
              Send via {isWA ? 'WhatsApp' : 'SMS'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ReminderManagement() {
  const { appointments, reminders, addReminder, updateReminder } = useAppointmentStore();

  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState<FilterStatus>('all');
  const [filterChannel, setFilterChannel] = useState<'all' | Channel>('all');
  const [preview,       setPreview]       = useState<PreviewState | null>(null);

  // ── Merge reminders with appointment data ──────────────────────────────────
  const rows = useMemo(() => {
    return reminders.map((r, i) => ({
      reminder: r,
      index: i,
      appt: appointments.find(a => a.id === r.appointment_id) ?? null,
    })).filter(({ appt }) => {
      if (!appt) return false;
      const q = search.toLowerCase();
      if (q && !(appt.patient?.profile?.full_name || '').toLowerCase().includes(q) &&
               !(appt.doctor?.profile?.full_name  || '').toLowerCase().includes(q)) return false;
      if (filterStatus  !== 'all' && appt.status as any !== filterStatus && 
          (filterStatus === 'sent' || filterStatus === 'pending' || filterStatus === 'failed')) {
        // filter by reminder status
        if (filterStatus !== (reminders[i]?.status as any)) return false;
      }
      if (filterChannel !== 'all' && reminders[i]?.channel !== filterChannel) return false;
      return true;
    });
  }, [reminders, appointments, search, filterStatus, filterChannel]);

  // filtered by reminder status separately
  const displayRows = useMemo(() => {
    return reminders.map((r, i) => ({
      r, i,
      appt: appointments.find(a => a.id === r.appointment_id) ?? null,
    })).filter(({ r, appt }) => {
      if (!appt) return false;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        (appt.patient?.profile?.full_name || '').toLowerCase().includes(q) ||
        (appt.doctor?.profile?.full_name  || '').toLowerCase().includes(q);
      const matchStatus  = filterStatus  === 'all' || r.status  === filterStatus;
      const matchChannel = filterChannel === 'all' || r.channel === filterChannel;
      return matchSearch && matchStatus && matchChannel;
    });
  }, [reminders, appointments, search, filterStatus, filterChannel]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   reminders.length,
    sent:    reminders.filter(r => r.status === 'sent').length,
    pending: reminders.filter(r => r.status === 'pending').length,
    failed:  reminders.filter(r => r.status === 'failed').length,
  }), [reminders]);

  // ── Open preview ───────────────────────────────────────────────────────────
  function openPreview(appt: Appointment, channel: Channel, reminderIndex: number) {
    setPreview({ appt, channel, reminderIndex });
  }

  // ── Simulate send ──────────────────────────────────────────────────────────
  function handleSimulateSend() {
    if (!preview) return;
    const { appt, channel } = preview;
    const existing = reminders.find(r => r.appointment_id === appt.id);
    const now = new Date().toISOString();

    if (existing) {
      updateReminder(existing.id, {
        status:   'sent',
        channel:  channel as any,
        sent_at:  now,
      });
    } else {
      addReminder({
        id:             'r' + Math.random().toString(36).slice(2, 9),
        appointment_id: appt.id,
        channel:        channel as any,
        language:       (appt.language ?? 'english') as any,
        status:         'sent' as any,
        sent_at:        now,
        created_at:     now,
      });
    }

    toast.success(
      `✅ ${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} sent to ${appt.patient?.profile?.full_name ?? 'patient'}`,
      { description: `Message dispatched at ${new Date().toLocaleTimeString()}` }
    );
    setPreview(null);
  }

  // ── Retry failed ───────────────────────────────────────────────────────────
  function handleRetry(reminderId: string, appt: Appointment) {
    const ch: Channel = 'sms'; // default retry via SMS
    openPreview(appt, ch, reminders.findIndex(r => r.id === reminderId));
  }

  // ── Bulk send pending ──────────────────────────────────────────────────────
  function handleBulkSend() {
    const now = new Date().toISOString();
    let count = 0;
    reminders.forEach(r => {
      if (r.status === 'pending') {
        updateReminder(r.id, { status: 'sent' as any, sent_at: now });
        count++;
      }
    });
    toast.success(`📨 ${count} reminder${count !== 1 ? 's' : ''} sent successfully`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reminders</h1>
            <p className="text-sm text-muted-foreground">
              Send multilingual appointment reminders via WhatsApp or SMS
            </p>
          </div>
          <Button
            disabled={stats.pending === 0}
            onClick={handleBulkSend}
            className="gap-1.5 self-start"
          >
            <Send className="h-4 w-4" />
            Bulk Send ({stats.pending} pending)
          </Button>
        </div>

        {/* ── Stat pills ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total',   value: stats.total,   cls: 'border-border bg-muted/30',              icon: <Bell        className="h-4 w-4 text-muted-foreground" /> },
            { label: 'Sent',    value: stats.sent,    cls: 'border-emerald-200 bg-emerald-50',        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />   },
            { label: 'Pending', value: stats.pending, cls: 'border-amber-200   bg-amber-50',          icon: <Clock        className="h-4 w-4 text-amber-600" />      },
            { label: 'Failed',  value: stats.failed,  cls: 'border-red-200     bg-red-50',            icon: <AlertCircle  className="h-4 w-4 text-red-600" />        },
          ].map(s => (
            <div key={s.label} className={cn('flex items-center gap-3 rounded-xl border p-4', s.cls)}>
              {s.icon}
              <div>
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground leading-tight">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Status filter */}
            {(['all', 'pending', 'sent', 'failed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f as FilterStatus)}
                className={cn(
                  'rounded-full border px-3.5 py-1 text-xs font-semibold capitalize transition-all',
                  filterStatus === f
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                )}
              >{f}</button>
            ))}
            <div className="h-6 w-px bg-border self-center" />
            {/* Channel filter */}
            {(['all', 'whatsapp', 'sms'] as const).map(c => (
              <button
                key={c}
                onClick={() => setFilterChannel(c)}
                className={cn(
                  'rounded-full border px-3.5 py-1 text-xs font-semibold capitalize transition-all flex items-center gap-1',
                  filterChannel === c
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                )}
              >
                {c === 'whatsapp' && <MessageCircle className="h-3 w-3" />}
                {c === 'sms'      && <MessageSquare  className="h-3 w-3" />}
                {c}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patient, doctor…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* ── Table ── */}
        <Card className="border-border overflow-hidden">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-primary" />
              Reminder Queue
              <span className="ml-auto text-xs font-normal text-muted-foreground">
                {displayRows.length} record{displayRows.length !== 1 ? 's' : ''}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {['Patient', 'Doctor', 'Appt Time', 'Language', 'Channel', 'Reminder Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                        <AlertCircle className="h-5 w-5 mx-auto mb-2 opacity-40" />
                        No reminders match your filters
                      </td>
                    </tr>
                  ) : displayRows.map(({ r, i, appt }) => {
                    if (!appt) return null;
                    const isSent = r.status === 'sent';

                    return (
                      <tr key={r.id} className={cn(
                        'transition-colors hover:bg-muted/30',
                        r.status === 'failed' && 'bg-red-50/40',
                      )}>
                        {/* Patient */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                              {(appt.patient?.profile?.full_name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-foreground leading-tight">{appt.patient?.profile?.full_name || '—'}</p>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Phone className="h-2.5 w-2.5" />{appt.patient?.profile?.phone || '—'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Doctor */}
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-foreground">{appt.doctor?.profile?.full_name || '—'}</p>
                          <p className="text-[11px] text-muted-foreground">{appt.doctor?.specialization || ''}</p>
                        </td>

                        {/* Time */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-semibold text-foreground">{appt.time_slot?.start_time || '—'}</p>
                          <p className="text-[11px] text-muted-foreground">{appt.time_slot?.date || ''}</p>
                        </td>

                        {/* Language */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium capitalize text-foreground border border-border">
                            {appt.language || 'english'}
                          </span>
                        </td>

                        {/* Channel */}
                        <td className="px-4 py-3">
                          <ChannelBadge channel={(r.channel as Channel) ?? 'sms'} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <StatusPill status={r.status as ReminderStatus} />
                            {r.sent_at && (
                              <p className="text-[10px] text-muted-foreground pl-0.5">
                                at {new Date(r.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {/* WhatsApp */}
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isSent}
                              onClick={() => openPreview(appt, 'whatsapp', i)}
                              className={cn(
                                'h-8 gap-1 text-xs font-semibold',
                                !isSent && 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50',
                                isSent  && 'opacity-40 cursor-not-allowed',
                              )}
                              title="Preview & send via WhatsApp"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              WA
                            </Button>

                            {/* SMS */}
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isSent}
                              onClick={() => openPreview(appt, 'sms', i)}
                              className={cn(
                                'h-8 gap-1 text-xs font-semibold',
                                !isSent && 'text-blue-700 hover:text-blue-800 hover:bg-blue-50',
                                isSent  && 'opacity-40 cursor-not-allowed',
                              )}
                              title="Preview & send via SMS"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              SMS
                            </Button>

                            {/* Retry failed */}
                            {r.status === 'failed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRetry(r.id, appt)}
                                className="h-8 gap-1 text-xs text-amber-700 hover:bg-amber-50"
                                title="Retry sending"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Retry
                              </Button>
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

      {/* ── Message Preview Modal ── */}
      {preview && (
        <MessagePreviewModal
          preview={preview}
          onClose={() => setPreview(null)}
          onSend={handleSimulateSend}
        />
      )}
    </DashboardLayout>
  );
}