import type { Appointment, Doctor, Patient, TimeSlot, Reminder, Prescription } from '@/types';

export const mockDoctors: Doctor[] = [
  { id: '1', user_id: 'd1', specialization: 'General Medicine', consultation_duration: 15, profile: { id: 'p1', user_id: 'd1', full_name: 'Dr. Anika Sharma', phone: '+91 98765 43210', language_pref: 'english', created_at: '2024-01-01' } },
  { id: '2', user_id: 'd2', specialization: 'Pediatrics', consultation_duration: 15, profile: { id: 'p2', user_id: 'd2', full_name: 'Dr. Rajesh Patel', phone: '+91 98765 43211', language_pref: 'hindi', created_at: '2024-01-01' } },
  { id: '3', user_id: 'd3', specialization: 'Dermatology', consultation_duration: 15, profile: { id: 'p3', user_id: 'd3', full_name: 'Dr. Priya Deshmukh', phone: '+91 98765 43212', language_pref: 'marathi', created_at: '2024-01-01' } },
];

export const mockPatients: Patient[] = [
  { id: '1', user_id: 'pt1', age: 34, gender: 'Male', blood_group: 'O+', profile: { id: 'pp1', user_id: 'pt1', full_name: 'Amit Kumar', phone: '+91 72495 74658', language_pref: 'hindi', created_at: '2024-01-15' } },
  { id: '2', user_id: 'pt2', age: 28, gender: 'Female', blood_group: 'A+', profile: { id: 'pp2', user_id: 'pt2', full_name: 'Sneha Reddy', phone: '+91 72495 74658', language_pref: 'english', created_at: '2024-02-01' } },
  { id: '3', user_id: 'pt3', age: 45, gender: 'Male', blood_group: 'B+', profile: { id: 'pp3', user_id: 'pt3', full_name: 'Vikram Singh', phone: '+91 72495 74658', language_pref: 'english', created_at: '2024-03-10' } },
];

export const mockTimeSlots: TimeSlot[] = [
  { id: 's1', doctor_id: '1', date: '2026-03-12', start_time: '10:00', end_time: '10:15', status: 'booked' },
  { id: 's2', doctor_id: '1', date: '2026-03-12', start_time: '10:15', end_time: '10:30', status: 'available' },
  { id: 's3', doctor_id: '1', date: '2026-03-12', start_time: '10:30', end_time: '10:45', status: 'available' },
  { id: 's4', doctor_id: '1', date: '2026-03-12', start_time: '10:45', end_time: '11:00', status: 'booked' },
  { id: 's5', doctor_id: '1', date: '2026-03-12', start_time: '11:00', end_time: '11:15', status: 'available' },
  { id: 's6', doctor_id: '1', date: '2026-03-12', start_time: '11:15', end_time: '11:30', status: 'blocked' },
  { id: 's7', doctor_id: '1', date: '2026-03-12', start_time: '11:30', end_time: '11:45', status: 'available' },
  { id: 's8', doctor_id: '1', date: '2026-03-12', start_time: '11:45', end_time: '12:00', status: 'available' },
  { id: 's9', doctor_id: '1', date: '2026-03-12', start_time: '14:00', end_time: '14:15', status: 'available' },
  { id: 's10', doctor_id: '1', date: '2026-03-12', start_time: '14:15', end_time: '14:30', status: 'booked' },
  { id: 's11', doctor_id: '1', date: '2026-03-12', start_time: '14:30', end_time: '14:45', status: 'available' },
  { id: 's12', doctor_id: '1', date: '2026-03-12', start_time: '14:45', end_time: '15:00', status: 'available' },
];

export const mockAppointments: Appointment[] = [
  { id: 'a1', patient_id: '1', doctor_id: '1', slot_id: 's1', status: 'confirmed', reason: 'Regular checkup', language: 'hindi', created_at: '2026-03-10', patient: mockPatients[0], doctor: mockDoctors[0], time_slot: mockTimeSlots[0] },
  { id: 'a2', patient_id: '2', doctor_id: '1', slot_id: 's4', status: 'scheduled', reason: 'Fever and cold', language: 'english', created_at: '2026-03-11', patient: mockPatients[1], doctor: mockDoctors[0], time_slot: mockTimeSlots[3] },
  { id: 'a3', patient_id: '3', doctor_id: '2', slot_id: 's10', status: 'completed', reason: 'Follow-up', language: 'english', created_at: '2026-03-08', patient: mockPatients[2], doctor: mockDoctors[1], time_slot: mockTimeSlots[9] },
  { id: 'a4', patient_id: '1', doctor_id: '3', slot_id: 's2', status: 'cancelled', reason: 'Skin rash', language: 'hindi', created_at: '2026-03-05', patient: mockPatients[0], doctor: mockDoctors[2], time_slot: mockTimeSlots[1] },
];

export const mockReminders: Reminder[] = [
  { id: 'r1', appointment_id: 'a1', channel: 'whatsapp', language: 'hindi', status: 'sent', sent_at: '2026-03-11T18:00:00', created_at: '2026-03-11' },
  { id: 'r2', appointment_id: 'a2', channel: 'sms', language: 'english', status: 'pending', created_at: '2026-03-11' },
  { id: 'r3', appointment_id: 'a3', channel: 'email', language: 'english', status: 'sent', sent_at: '2026-03-07T10:00:00', created_at: '2026-03-07' },
  { id: 'r4', appointment_id: 'a4', channel: 'whatsapp', language: 'hindi', status: 'failed', created_at: '2026-03-04' },
];

export const mockPrescriptions: Prescription[] = [
  {
    id: 'rx1', appointment_id: 'a3', doctor_id: '2', patient_id: '3',
    medications: [
      { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days' },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '7 days' },
    ],
    notes: 'Take rest and drink plenty of fluids',
    created_at: '2026-03-08',
  },
];
