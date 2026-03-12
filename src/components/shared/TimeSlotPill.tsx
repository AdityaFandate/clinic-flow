import { cn } from '@/lib/utils';
import type { SlotStatus } from '@/types';

interface TimeSlotPillProps {
  time: string;
  status: SlotStatus;
  selected?: boolean;
  onClick?: () => void;
}

const slotStyles: Record<SlotStatus, string> = {
  available: 'bg-success/10 text-success border-success/30 hover:bg-success/20 cursor-pointer',
  booked: 'bg-muted text-muted-foreground border-border cursor-not-allowed opacity-60',
  blocked: 'bg-muted text-muted-foreground border-border cursor-not-allowed opacity-40 line-through',
};

export function TimeSlotPill({ time, status, selected, onClick }: TimeSlotPillProps) {
  return (
    <button
      type="button"
      disabled={status !== 'available'}
      onClick={onClick}
      className={cn(
        'rounded-lg border px-3 py-2 text-sm font-medium transition-all',
        slotStyles[status],
        selected && status === 'available' && 'ring-2 ring-primary bg-primary text-primary-foreground border-primary'
      )}
    >
      {time}
    </button>
  );
}
