import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Appointment, Patient, Doctor, Reminder, AppointmentStatus, Language, TimeSlot } from '@/types';
import { mockAppointments, mockDoctors, mockPatients, mockReminders, mockTimeSlots } from '@/lib/mock-data';

interface AppointmentState {
  appointments: Appointment[];
  doctors: Doctor[];
  patients: Patient[];
  reminders: Reminder[];
  timeSlots: TimeSlot[];
  
  // Actions
  setAppointments: (appts: Appointment[]) => void;
  addAppointment: (appt: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  
  confirmAppointment: (id: string) => void;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, slotId: string, slot: TimeSlot) => void;
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set) => ({
      appointments: [...mockAppointments],
      doctors: [...mockDoctors],
      patients: [...mockPatients],
      reminders: [...mockReminders],
      timeSlots: [...mockTimeSlots],

      setAppointments: (appointments) => set({ appointments }),
      
      addAppointment: (appt) => set((state) => ({ 
        appointments: [...state.appointments, appt] 
      })),

      updateAppointment: (id, updates) => set((state) => ({
        appointments: state.appointments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      })),

      addReminder: (reminder) => set((state) => ({ 
        reminders: [...state.reminders, reminder] 
      })),

      updateReminder: (id, updates) => set((state) => ({
        reminders: state.reminders.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      })),

      confirmAppointment: (id) => set((state) => ({
        appointments: state.appointments.map((a) => 
          a.id === id ? { ...a, status: 'confirmed' as AppointmentStatus } : a
        ),
      })),

      cancelAppointment: (id) => set((state) => ({
        appointments: state.appointments.map((a) => 
          a.id === id ? { ...a, status: 'cancelled' as AppointmentStatus } : a
        ),
      })),

      rescheduleAppointment: (id, slotId, slot) => set((state) => ({
        appointments: state.appointments.map((a) => 
          a.id === id ? { ...a, slot_id: slotId, time_slot: slot, status: 'scheduled' as AppointmentStatus } : a
        ),
      })),
    }),
    {
      name: 'clinicos-appointments',
    }
  )
);
