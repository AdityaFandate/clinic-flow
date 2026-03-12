

# ClinicOS — Implementation Plan

## Overview

Building a full-stack clinic appointment management system with React/Vite frontend, Supabase backend, Zustand state management, and n8n webhook integrations. The uploaded logo (ClinicFlow) will be used as the app logo.

Note: The logo says "ClinicFlow" but the app is named "ClinicOS" per the spec. I will use the icon portion of the logo and pair it with "ClinicOS" text branding.

---

## Phase 1: Foundation

### 1.1 Project Setup
- Copy logo to `src/assets/clinicos-logo.png`
- Install Zustand and Axios
- Update `index.html` title/meta to "ClinicOS"
- Update color theme in `src/index.css` to match the brand spec (primary `#1A6BFF`, background `#F4F6FA`, etc.)
- Add Inter font via Google Fonts
- Remove `src/App.css` boilerplate

### 1.2 Folder Structure
```text
src/
├── assets/          # Logo, static images
├── components/
│   ├── ui/          # ShadCN (existing)
│   ├── layout/      # Sidebar, Navbar, PageWrapper
│   └── shared/      # AppointmentCard, StatusBadge, StatCard, TimeSlotPill, PatientRow
├── hooks/           # Custom hooks
├── lib/             # utils, supabase client, axios instance
├── pages/
│   ├── auth/        # Login
│   ├── patient/     # Dashboard, BookAppointment, Prescriptions
│   ├── receptionist/# Dashboard, QuickBook, Patients, Schedule, Reminders
│   ├── doctor/      # DailyView, PatientProfile, Prescriptions
│   └── admin/       # Dashboard, ManageDoctors, ManageStaff, Settings, Logs
├── stores/          # Zustand stores (auth, appointments, ui)
├── types/           # TypeScript interfaces
└── routes/          # Route config with role guards
```

### 1.3 Supabase Setup
Connect Supabase and create tables:

- **profiles** — extends auth.users (name, phone, avatar_url, language_pref)
- **user_roles** — (user_id, role enum: patient/receptionist/doctor/admin)
- **doctors** — (user_id, specialization, consultation_duration)
- **patients** — (user_id, age, gender, blood_group, medical_history)
- **doctor_schedules** — (doctor_id, day_of_week, start_time, end_time, is_active)
- **time_slots** — (doctor_id, date, start_time, end_time, status: available/booked/blocked)
- **appointments** — (patient_id, doctor_id, slot_id, status, reason, language, notes)
- **prescriptions** — (appointment_id, doctor_id, patient_id, medications jsonb, notes)
- **reminders** — (appointment_id, channel, language, status, sent_at)
- **system_logs** — (action, user_id, details, created_at)

RLS policies using `has_role()` security definer function per the security guidelines.

---

## Phase 2: Auth & Routing

### 2.1 Authentication
- Supabase Auth with email/password
- Login page: two-column layout — left branding with logo, right login form with role selector pills
- After login, fetch user role from `user_roles` table
- Zustand auth store: user, role, session, loading

### 2.2 Protected Routes
- `ProtectedRoute` component checks auth + role
- Role-based redirect after login:
  - Patient → `/patient/dashboard`
  - Receptionist → `/receptionist/dashboard`
  - Doctor → `/doctor/daily-view`
  - Admin → `/admin/dashboard`

---

## Phase 3: Core UI Screens (10 screens)

### Screen 1 — Login Page
Two-column: branding left (logo, tagline "Your clinic, fully automated.", medical pattern bg), login card right with email/password/role pills.

### Screen 2 — Patient Dashboard
Upcoming appointments, history, book button, prescription history.

### Screen 3 — Receptionist Dashboard
Sidebar nav, stat cards (today's appointments, pending, cancellations, available slots), today's schedule table, floating Quick Book button.

### Screen 4 — Book Appointment
Form with patient name, mobile, doctor dropdown, date picker, time slot grid (green=available, gray=taken), reason, language toggle, confirm button with conflict warnings.

### Screen 5 — Doctor Daily View
Mini calendar, vertical timeline with appointment cards (patient, time, reason, status badge), list/timeline toggle.

### Screen 6 — Patient Profile
Avatar with initials, info fields, tabs for history/upcoming/notes/prescriptions.

### Screen 7 — Reminder Management
Table with patient, time, channel, language, status. Send/bulk send buttons. Color-coded statuses.

### Screen 8 — Voice Assistant Widget
Floating widget with mic button, language selector, transcript area, AI response, status indicator. (UI only initially, wired to n8n webhook later.)

### Screen 9 — Admin Dashboard
Analytics cards, doctor/staff management panels, system logs.

### Screen 10 — Mobile Booking View
Responsive stacked layout, large buttons, sticky bottom confirm.

---

## Phase 4: Shared Components

- **AppointmentCard** — patient name, time, status badge, reason
- **StatusBadge** — color-coded pill (confirmed/pending/cancelled/completed)
- **StatCard** — icon, label, value, trend indicator
- **TimeSlotPill** — clickable slot with available/booked/blocked states
- **PatientRow** — avatar, name, phone, last visit
- **NavigationItem** — sidebar nav item with icon and active state

---

## Phase 5: Business Logic

- Slot generation from doctor schedules
- Booking validation (check availability, prevent double-booking)
- Appointment CRUD with status transitions
- Prescription creation by doctors
- Reminder status tracking

---

## Phase 6: n8n Integration

- Axios calls to n8n webhook URLs (stored as env vars)
- Appointment creation webhook
- Reminder trigger webhook
- Voice assistant webhook (receives transcript, returns booking confirmation)
- Workflow JSON templates provided in docs

---

## Technical Decisions

| Concern | Approach |
|---------|----------|
| State | Zustand for auth/UI, TanStack Query for server data |
| API calls | Axios instance with Supabase token header for n8n webhooks; Supabase client for DB |
| Forms | React Hook Form + Zod validation |
| Roles | Separate `user_roles` table with `has_role()` security definer |
| Styling | Tailwind + ShadCN, Inter font, flat design per brand spec |

---

## Implementation Order

1. Foundation setup (theme, logo, deps, folder structure)
2. Supabase schema + RLS
3. Auth flow + login page
4. Layout components (sidebar, navbar)
5. Shared components
6. All 10 screens with real data
7. Business logic (scheduling, booking)
8. n8n webhook integration
9. Voice assistant UI
10. Polish and responsive design

