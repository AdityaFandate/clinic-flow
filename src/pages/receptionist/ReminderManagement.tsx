import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bell, Send, Search, MessageCircle, MessageSquare,
  Phone, X, CheckCircle2, AlertCircle, Clock, RefreshCw,
  Wifi, BatteryMedium, Signal,
} from 'lucide-react';
import { useAppointmentStore } from '@/stores/appointmentStore';
import type { Appointment, ReminderStatus } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
type Channel = 'whatsapp' | 'sms';
type FilterStatus = 'all' | ReminderStatus;
interface PreviewState { appt: Appointment; channel: Channel; }

// ─── Multilingual message builder ─────────────────────────────────────────────
function buildMessage(appt: Appointment, channel: Channel): string {
  const name   = appt.patient?.profile?.full_name || 'Patient';
  const doc    = appt.doctor?.profile?.full_name  || 'Doctor';
  const time   = appt.time_slot?.start_time       || '—';
  const date   = appt.time_slot?.date             || 'today';
  const clinic = 'Riverside Clinic';
  const ph     = '(022) 1234-5678';
  const isWA   = channel === 'whatsapp';

  if (appt.language === 'hindi') {
    return isWA
      ? `🏥 *${clinic}* — अपॉइंटमेंट रिमाइंडर\n\nनमस्ते *${name}* जी,\n\nआपकी अपॉइंटमेंट:\n📅 दिनांक: *${date}*\n⏰ समय: *${time}*\n👨‍⚕️ डॉक्टर: *${doc}*\n\nकृपया 10 मिनट पहले पहुँचें।\nजानकारी: ${ph}\n\n_धन्यवाद!_ 🙏`
      : `${clinic}: नमस्ते ${name} जी, अपॉइंटमेंट ${doc} के साथ ${date} को ${time} बजे। समय पर पहुँचें। ${ph}`;
  }
  if (appt.language === 'marathi') {
    return isWA
      ? `🏥 *${clinic}* — अपॉइंटमेंट रिमाइंडर\n\nनमस्कार *${name}*,\n\nतुमची अपॉइंटमेंट:\n📅 दिनांक: *${date}*\n⏰ वेळ: *${time}*\n👨‍⚕️ डॉक्टर: *${doc}*\n\nकृपया 10 मिनिटे आधी या.\nचौकशी: ${ph}\n\n_धन्यवाद!_ 🙏`
      : `${clinic}: नमस्कार ${name}, अपॉइंटमेंट ${doc} यांच्यासोबत ${date} रोजी ${time} वाजता. वेळेवर या. ${ph}`;
  }
  return isWA
    ? `🏥 *${clinic}* — Appointment Reminder\n\nHello *${name}*,\n\nYour appointment:\n📅 Date: *${date}*\n⏰ Time: *${time}*\n👨‍⚕️ Doctor: *${doc}*\n\nPlease arrive 10 minutes early.\nQueries? ${ph}\n\n_Thank you!_ 😊`
    : `${clinic}: Hi ${name}, your appt with ${doc} is on ${date} at ${time}. Arrive 10 min early. ${ph}`;
}

// ─── Double tick ──────────────────────────────────────────────────────────────
function DoubleTick({ blue = false }: { blue?: boolean }) {
  return (
    <svg className={cn('h-3.5 w-3.5 transition-colors duration-500', blue ? 'text-[#53bdeb]' : 'text-[#075e54]/40')}
      viewBox="0 0 16 11" fill="currentColor">
      <path d="M11.071.653a.75.75 0 0 1 .01 1.06L6.34 6.74a.75.75 0 0 1-1.055.011L3.17 4.66a.75.75 0 0 1 1.045-1.076l1.6 1.556L10.01.663a.75.75 0 0 1 1.06-.01Z"/>
      <path d="M14.65.653a.75.75 0 0 1 .01 1.06L6.34 9.74a.75.75 0 0 1-1.055.011L3.17 7.66a.75.75 0 0 1 1.045-1.076l1.6 1.556L13.59.663a.75.75 0 0 1 1.06-.01Z"/>
    </svg>
  );
}

// ─── Phone status bar ─────────────────────────────────────────────────────────
function PhoneBar() {
  return (
    <div className="flex items-center justify-between bg-gray-900 px-4 py-1">
      <span className="text-[10px] font-semibold text-white">9:41</span>
      <div className="flex items-center gap-1">
        <Signal className="h-2.5 w-2.5 text-white" />
        <Wifi className="h-2.5 w-2.5 text-white" />
        <BatteryMedium className="h-2.5 w-2.5 text-white" />
      </div>
    </div>
  );
}

// ─── WhatsApp mockup ──────────────────────────────────────────────────────────
function WhatsAppMockup({ appt, step }: { appt: Appointment; step: 'idle' | 'sending' | 'sent' }) {
  const msg      = buildMessage(appt, 'whatsapp');
  const time     = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const name     = appt.patient?.profile?.full_name || 'Patient';
  const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  const visible  = step !== 'idle';

  return (
    <div className="mx-auto w-[272px] overflow-hidden rounded-[28px] border-[5px] border-gray-900 shadow-2xl">
      <PhoneBar />
      {/* WA header */}
      <div className="flex items-center gap-2 bg-[#128c7e] px-3 py-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">{initials}</div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-[11px] font-semibold text-white leading-tight">{name}</p>
          <p className="text-[9px] text-white/70">{step === 'sending' ? 'typing…' : step === 'sent' ? 'online' : appt.patient?.profile?.phone}</p>
        </div>
        <MessageCircle className="h-3.5 w-3.5 text-white/50" />
      </div>

      {/* Chat body */}
      <div className="min-h-[300px] p-3 space-y-2"
        style={{ background: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' fill='%23e8f5e9' fill-opacity='0.4'/%3E%3C/svg%3E\") #e5ddd5" }}>

        <div className="flex justify-center">
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[8px] text-gray-500 shadow-sm">Today</span>
        </div>

        {/* Bubble */}
        <div className={cn('flex justify-end transition-all duration-500', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3')}>
          <div className="relative max-w-[85%] rounded-xl rounded-tr-sm bg-[#dcf8c6] px-2.5 py-2 shadow-sm">
            <pre className="whitespace-pre-wrap font-sans text-[9px] leading-relaxed text-[#075e54]">{msg}</pre>
            <div className="mt-1 flex items-center justify-end gap-0.5">
              <span className="text-[7px] text-[#075e54]/50">{time}</span>
              <DoubleTick blue={step === 'sent'} />
            </div>
          </div>
        </div>

        {step === 'sending' && (
          <div className="flex justify-center">
            <span className="animate-pulse rounded-full bg-white/80 px-2 py-0.5 text-[8px] text-[#128c7e]">Sending…</span>
          </div>
        )}
        {step === 'sent' && (
          <div className="flex justify-center">
            <span className="rounded-full bg-[#dcf8c6] px-2 py-0.5 text-[8px] text-[#128c7e]">✓ Delivered</span>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-1.5 border-t border-gray-100 bg-[#f0f0f0] px-2 py-1.5">
        <div className="flex-1 rounded-full bg-white px-2.5 py-1 text-[9px] text-gray-400">Message</div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#128c7e]">
          <Send className="h-2.5 w-2.5 text-white" />
        </div>
      </div>
    </div>
  );
}

// ─── SMS mockup ───────────────────────────────────────────────────────────────
function SmsMockup({ appt, step }: { appt: Appointment; step: 'idle' | 'sending' | 'sent' }) {
  const msg     = buildMessage(appt, 'sms');
  const time    = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const visible = step !== 'idle';

  return (
    <div className="mx-auto w-[272px] overflow-hidden rounded-[28px] border-[5px] border-gray-900 shadow-2xl">
      <PhoneBar />
      <div className="flex items-center gap-2 bg-[#2563eb] px-3 py-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">RC</div>
        <div>
          <p className="text-[11px] font-semibold text-white">Riverside Clinic</p>
          <p className="text-[9px] text-white/70">{appt.patient?.profile?.phone}</p>
        </div>
      </div>

      <div className="min-h-[300px] bg-[#f0f4f8] p-3 space-y-2">
        <div className="flex justify-center">
          <span className="rounded-full bg-white px-2 py-0.5 text-[8px] text-gray-400">Today {time}</span>
        </div>

        <div className={cn('flex justify-end transition-all duration-500', visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3')}>
          <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-[#2563eb] px-2.5 py-2 shadow-sm">
            <p className="text-[9px] leading-relaxed text-white">{msg}</p>
            <p className="mt-0.5 text-right text-[7px] text-white/60">
              {time} {step === 'sent' ? '✓ Delivered' : step === 'sending' ? '⌛' : ''}
            </p>
          </div>
        </div>

        {step === 'sending' && (
          <div className="flex justify-center">
            <span className="animate-pulse rounded-full bg-white px-2 py-0.5 text-[8px] text-blue-600">Sending…</span>
          </div>
        )}
        {step === 'sent' && (
          <div className="flex justify-center">
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[8px] text-blue-700">✓ Message Delivered</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 border-t border-gray-100 bg-[#f0f0f0] px-2 py-1.5">
        <div className="flex-1 rounded-full bg-white px-2.5 py-1 text-[9px] text-gray-400">iMessage</div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563eb]">
          <Send className="h-2.5 w-2.5 text-white" />
        </div>
      </div>
    </div>
  );
}

// ─── Preview + Send Modal ─────────────────────────────────────────────────────
function PreviewModal({ preview, onClose, onSent }: {
  preview: PreviewState; onClose: () => void; onSent: () => void;
}) {
  const { appt, channel } = preview;
  const isWA = channel === 'whatsapp';
  const [step, setStep] = useState<'idle' | 'sending' | 'sent'>('idle');

  function handleSend() {
    setStep('sending');
    setTimeout(() => {
      setStep('sent');
      onSent(); // update store immediately so table updates
      setTimeout(onClose, 2000);
    }, 2200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
      onClick={step === 'idle' ? onClose : undefined}>
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={cn('flex items-center justify-between px-5 py-3 text-white', isWA ? 'bg-[#128c7e]' : 'bg-[#2563eb]')}>
          <div className="flex items-center gap-2">
            {isWA ? <MessageCircle className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
            <div>
              <p className="text-sm font-semibold">{isWA ? 'WhatsApp' : 'SMS'} Preview</p>
              <p className="text-[11px] text-white/70">
                To: {appt.patient?.profile?.full_name} · {appt.patient?.profile?.phone}
              </p>
            </div>
          </div>
          {step === 'idle' && (
            <button onClick={onClose} className="rounded-full p-1 hover:bg-white/20 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Phone mockup */}
        <div className="bg-gray-100 py-6 px-4">
          {isWA
            ? <WhatsAppMockup appt={appt} step={step} />
            : <SmsMockup      appt={appt} step={step} />
          }
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card px-5 py-4">
          {step === 'idle' && (
            <>
              <p className="mb-3 text-center text-xs text-muted-foreground">
                Message in <span className="font-semibold capitalize">{appt.language || 'English'}</span> · via {isWA ? 'WhatsApp Business API' : 'SMS Gateway'}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSend}
                  className={cn('flex-[2] gap-2 font-semibold text-white', isWA ? 'bg-[#128c7e] hover:bg-[#0e7063]' : 'bg-[#2563eb] hover:bg-[#1d4ed8]')}>
                  <Send className="h-3.5 w-3.5" />
                  Send via {isWA ? 'WhatsApp' : 'SMS'}
                </Button>
              </div>
            </>
          )}
          {step === 'sending' && (
            <div className="flex items-center justify-center gap-2.5 py-1">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm font-medium text-muted-foreground">Sending message…</p>
            </div>
          )}
          {step === 'sent' && (
            <div className="flex items-center justify-center gap-2 py-1">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-700">Message delivered successfully!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
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

function ChannelBadge({ channel }: { channel: Channel }) {
  return channel === 'whatsapp'
    ? <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-700"><MessageCircle className="h-3 w-3" />WhatsApp</span>
    : <span className="inline-flex items-center gap-1 rounded-md bg-blue-50   border border-blue-200   px-2 py-0.5 text-xs font-medium text-blue-700"><MessageSquare className="h-3 w-3" />SMS</span>;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function ReminderManagement() {
  const { appointments, reminders, addReminder, updateReminder } = useAppointmentStore();

  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState<FilterStatus>('all');
  const [filterChannel, setFilterChannel] = useState<'all' | Channel>('all');
  const [preview,       setPreview]       = useState<PreviewState | null>(null);

  const stats = useMemo(() => ({
    total:   reminders.length,
    sent:    reminders.filter(r => r.status === 'sent').length,
    pending: reminders.filter(r => r.status === 'pending').length,
    failed:  reminders.filter(r => r.status === 'failed').length,
  }), [reminders]);

  const displayRows = useMemo(() => {
    return reminders.map(r => ({
      r,
      appt: appointments.find(a => a.id === r.appointment_id) ?? null,
    })).filter(({ r, appt }) => {
      if (!appt) return false;
      const q = search.toLowerCase();
      const matchSearch  = !q
        || (appt.patient?.profile?.full_name || '').toLowerCase().includes(q)
        || (appt.doctor?.profile?.full_name  || '').toLowerCase().includes(q);
      const matchStatus  = filterStatus  === 'all' || r.status  === filterStatus;
      const matchChannel = filterChannel === 'all' || r.channel === filterChannel;
      return matchSearch && matchStatus && matchChannel;
    });
  }, [reminders, appointments, search, filterStatus, filterChannel]);

  function markSent(appt: Appointment, channel: Channel) {
    const now      = new Date().toISOString();
    const existing = reminders.find(r => r.appointment_id === appt.id);
    if (existing) {
      updateReminder(existing.id, { status: 'sent' as any, channel: channel as any, sent_at: now });
    } else {
      addReminder({
        id: 'r' + Math.random().toString(36).slice(2, 9),
        appointment_id: appt.id,
        channel: channel as any,
        language: (appt.language ?? 'english') as any,
        status: 'sent' as any,
        sent_at: now,
        created_at: now,
      });
    }
    toast.success(
      `${channel === 'whatsapp' ? '📱 WhatsApp' : '💬 SMS'} delivered to ${appt.patient?.profile?.full_name}`,
      { description: `Sent at ${new Date().toLocaleTimeString()} · Language: ${appt.language || 'English'}` }
    );
  }

  function handleBulkSend() {
    const now = new Date().toISOString();
    let count = 0;
    reminders.forEach(r => {
      if (r.status === 'pending') { updateReminder(r.id, { status: 'sent' as any, sent_at: now }); count++; }
    });
    toast.success(`📨 ${count} reminder${count !== 1 ? 's' : ''} sent successfully`);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reminders</h1>
            <p className="text-sm text-muted-foreground">Send multilingual appointment reminders via WhatsApp or SMS</p>
          </div>
          <Button disabled={stats.pending === 0} onClick={handleBulkSend} className="gap-1.5 self-start">
            <Send className="h-4 w-4" /> Bulk Send ({stats.pending} pending)
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label:'Total',   value:stats.total,   cls:'border-border bg-muted/30',       icon:<Bell         className="h-4 w-4 text-muted-foreground"/> },
            { label:'Sent',    value:stats.sent,    cls:'border-emerald-200 bg-emerald-50', icon:<CheckCircle2 className="h-4 w-4 text-emerald-600"/>     },
            { label:'Pending', value:stats.pending, cls:'border-amber-200   bg-amber-50',   icon:<Clock        className="h-4 w-4 text-amber-600"/>       },
            { label:'Failed',  value:stats.failed,  cls:'border-red-200     bg-red-50',     icon:<AlertCircle  className="h-4 w-4 text-red-600"/>         },
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

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(['all','pending','sent','failed'] as const).map(f => (
              <button key={f} onClick={() => setFilterStatus(f as FilterStatus)}
                className={cn('rounded-full border px-3.5 py-1 text-xs font-semibold capitalize transition-all',
                  filterStatus === f ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40')}>
                {f}
              </button>
            ))}
            <div className="h-6 w-px bg-border self-center" />
            {(['all','whatsapp','sms'] as const).map(c => (
              <button key={c} onClick={() => setFilterChannel(c)}
                className={cn('rounded-full border px-3.5 py-1 text-xs font-semibold capitalize transition-all flex items-center gap-1',
                  filterChannel === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40')}>
                {c === 'whatsapp' && <MessageCircle className="h-3 w-3" />}
                {c === 'sms'      && <MessageSquare  className="h-3 w-3" />}
                {c}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patient, doctor…" value={search}
              onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>

        {/* Table */}
        <Card className="border-border overflow-hidden">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="h-4 w-4 text-primary" /> Reminder Queue
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
                    {['Patient','Doctor','Appt Time','Language','Channel','Status','Send'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayRows.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      <AlertCircle className="h-5 w-5 mx-auto mb-2 opacity-40" />
                      No reminders match your filters
                    </td></tr>
                  ) : displayRows.map(({ r, appt }) => {
                    if (!appt) return null;
                    const isSent = r.status === 'sent';
                    return (
                      <tr key={r.id} className={cn('transition-colors hover:bg-muted/30', r.status === 'failed' && 'bg-red-50/40')}>

                        {/* Patient */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                              {(appt.patient?.profile?.full_name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
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
                          <div className="space-y-0.5">
                            <StatusPill status={r.status as ReminderStatus} />
                            {r.sent_at && (
                              <p className="text-[10px] text-muted-foreground pl-0.5">
                                {new Date(r.sent_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" disabled={isSent}
                              onClick={() => setPreview({ appt, channel: 'whatsapp' })}
                              className={cn('h-8 gap-1 text-xs font-semibold',
                                !isSent ? 'text-emerald-700 hover:bg-emerald-50' : 'opacity-40 cursor-not-allowed')}
                              title="Send via WhatsApp">
                              <MessageCircle className="h-3.5 w-3.5" /> WA
                            </Button>
                            <Button size="sm" variant="ghost" disabled={isSent}
                              onClick={() => setPreview({ appt, channel: 'sms' })}
                              className={cn('h-8 gap-1 text-xs font-semibold',
                                !isSent ? 'text-blue-700 hover:bg-blue-50' : 'opacity-40 cursor-not-allowed')}
                              title="Send via SMS">
                              <MessageSquare className="h-3.5 w-3.5" /> SMS
                            </Button>
                            {r.status === 'failed' && (
                              <Button size="sm" variant="ghost"
                                onClick={() => setPreview({ appt, channel: 'whatsapp' })}
                                className="h-8 gap-1 text-xs text-amber-700 hover:bg-amber-50">
                                <RefreshCw className="h-3.5 w-3.5" /> Retry
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

      {preview && (
        <PreviewModal
          preview={preview}
          onClose={() => setPreview(null)}
          onSent={() => markSent(preview.appt, preview.channel)}
        />
      )}
    </DashboardLayout>
  );
}