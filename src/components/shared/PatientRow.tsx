import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Patient } from '@/types';

interface PatientRowProps {
  patient: Patient;
  onClick?: () => void;
}

export function PatientRow({ patient, onClick }: PatientRowProps) {
  const name = patient.profile?.full_name || 'Unknown';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent cursor-pointer"
      onClick={onClick}
    >
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        <p className="text-xs text-muted-foreground">{patient.profile?.phone}</p>
      </div>
      {patient.age && (
        <span className="text-xs text-muted-foreground">{patient.age}y, {patient.gender}</span>
      )}
    </div>
  );
}
