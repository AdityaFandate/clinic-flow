import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { Clock, User } from 'lucide-react';
import type { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: () => void;
}

export function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
  return (
    <Card className="cursor-pointer border-border transition-shadow hover:shadow-md" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground truncate">
                {appointment.patient?.profile?.full_name || 'Unknown Patient'}
              </p>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {appointment.time_slot?.start_time} — {appointment.time_slot?.end_time}
              </p>
            </div>
            {appointment.reason && (
              <p className="text-xs text-muted-foreground truncate">{appointment.reason}</p>
            )}
          </div>
          <StatusBadge status={appointment.status} />
        </div>
      </CardContent>
    </Card>
  );
}
