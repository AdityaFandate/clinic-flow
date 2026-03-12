export type AppRole = 'patient' | 'receptionist' | 'doctor' | 'admin';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export type SlotStatus = 'available' | 'booked' | 'blocked';

export type ReminderStatus = 'pending' | 'sent' | 'failed';

export type ReminderChannel = 'sms' | 'whatsapp' | 'email';

export type Language = 'english' | 'hindi' | 'marathi';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  avatar_url?: string;
  language_pref: Language;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  consultation_duration: number;
  profile?: Profile;
}

export interface Patient {
  id: string;
  user_id: string;
  age?: number;
  gender?: string;
  blood_group?: string;
  medical_history?: string;
  profile?: Profile;
}

export interface DoctorSchedule {
  id: string;
  doctor_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface TimeSlot {
  id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: SlotStatus;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  slot_id: string;
  status: AppointmentStatus;
  reason?: string;
  language: Language;
  notes?: string;
  created_at: string;
  patient?: Patient;
  doctor?: Doctor;
  time_slot?: TimeSlot;
}

export interface Prescription {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  medications: PrescriptionMedication[];
  notes?: string;
  created_at: string;
}

export interface PrescriptionMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Reminder {
  id: string;
  appointment_id: string;
  channel: ReminderChannel;
  language: Language;
  status: ReminderStatus;
  sent_at?: string;
  created_at: string;
  appointment?: Appointment;
}

export interface SystemLog {
  id: string;
  action: string;
  user_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface StatCardData {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; positive: boolean };
}
