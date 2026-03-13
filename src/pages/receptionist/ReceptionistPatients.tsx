import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/shared/StatCard';
import {
  Users, Search, Phone, Mail, Heart, Droplets, User, AlertCircle, Plus,
  MessageCircle, X
} from 'lucide-react';
import { useAppointmentStore } from '@/stores/appointmentStore';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function ReceptionistPatients() {
  const navigate = useNavigate();
  const { patients } = useAppointmentStore();
  const [search, setSearch] = useState('');
  const [previewChat, setPreviewChat] = useState<any>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return patients;
    return patients.filter(p =>
      (p.profile?.full_name || '').toLowerCase().includes(q) ||
      (p.profile?.phone || '').toLowerCase().includes(q) ||
      (p.blood_group || '').toLowerCase().includes(q)
    );
  }, [patients, search]);

  function handleQuickBook(patient: any) {
    // Navigate to dashboard and trigger booking modal via custom event
    navigate('/receptionist/dashboard');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('clinic:voice-action', {
        detail: {
          type: 'book_appointment',
          patient_name: patient.profile?.full_name,
          phone: patient.profile?.phone,
        }
      }));
    }, 100);
  }

  function handleQuickWhatsApp(patient: any) {
    setPreviewChat(patient);
  }

  function handleSimulateChat() {
    toast.success(`Simulated chat initiated with ${previewChat?.profile?.full_name}`);
    setPreviewChat(null);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Patients</h1>
            <p className="text-sm text-muted-foreground">Directory of registered clinic patients</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search patient…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Patients" value={patients.length} icon={Users} />
          <StatCard label="Male" value={patients.filter(p => p.gender === 'Male').length} icon={User} />
          <StatCard label="Female" value={patients.filter(p => p.gender === 'Female').length} icon={User} />
        </div>

        {/* Patients Grid */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" /> Patient Directory
              <span className="ml-auto text-sm font-normal text-muted-foreground">{filtered.length} patient{filtered.length !== 1 ? 's' : ''}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground"><AlertCircle className="h-5 w-5 mx-auto mb-2 opacity-50" /> No patients found</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(p => (
                  <div key={p.id} className="rounded-lg border border-border p-4 hover:shadow-md transition-all bg-card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {(p.profile?.full_name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{p.profile?.full_name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{p.age ? `${p.age} yrs` : ''}{p.age && p.gender ? ' · ' : ''}{p.gender || ''}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-2"><Phone className="h-3 w-3" /><span>{p.profile?.phone || 'No phone'}</span></div>
                      <div className="flex items-center gap-2"><Droplets className="h-3 w-3 text-destructive" /><span>Blood Group: <span className="font-medium text-foreground">{p.blood_group}</span></span></div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button size="sm" variant="outline" className="flex-1 h-8 text-[11px] px-2" onClick={() => handleQuickBook(p)}><Plus className="h-3 w-3 mr-1" /> Book</Button>
                      <Button size="sm" variant="ghost" className="h-8 text-[11px] px-2 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleQuickWhatsApp(p)}><MessageCircle className="h-3 w-3 mr-1" /> Chat</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Simulated Message Preview Modal */}
      {previewChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4" onClick={() => setPreviewChat(null)}>
          <div className="w-full max-w-md bg-card rounded-2xl shadow-xl overflow-hidden border border-border flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 flex text-white items-center justify-between bg-[#128C7E]">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-medium text-sm">Start Chat • WhatsApp</span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-white hover:bg-white/20" onClick={() => setPreviewChat(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 bg-muted/30">
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Phone className="h-3 w-3" /> Sending to: <span className="font-medium text-foreground">{previewChat.profile?.phone}</span>
              </div>
              <div className="p-4 rounded-xl text-sm whitespace-pre-wrap relative bg-[#DCF8C6] text-[#075E54]">
                Hello {previewChat.profile?.full_name}, this is ClinicOS.
                <div className="absolute bottom-2 right-2 text-[10px] text-black/40">
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setPreviewChat(null)}>Cancel</Button>
              <Button onClick={handleSimulateChat} className="flex-1 bg-[#128C7E] hover:bg-[#075e54] text-white">
                Start Simulated Chat
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
