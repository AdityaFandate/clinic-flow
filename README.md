# ClinicOS — Single Operating System for Doctor's Clinics 🏥

Running a doctor's clinic is operationally exhausting for a receptionist. ClinicOS is a complete, fully-deployed, full-stack web application that serves as a single operating system for a doctor's clinic. It handles everything from appointment booking and schedule management to automated reminders, all with zero manual effort.

## ✨ Key Features

### 1. Unified Receptionist Dashboard
- Single-page view of today's schedule.
- Instant access to patient details, quick booking actions, and doctor load metrics.
- Seamless "Quick Book" flow directly from the patient directory to prevent double data entry.

### 2. Smart Scheduling & Clash Detection
- Real-time time slot availability mapping based on the selected doctor's schedule.
- **Auto-Rescheduling (Emergency Override):** If the receptionist needs to force book an emergency appointment into an already occupied slot, ClinicOS automatically finds the next available slot for the displaced patient, reschedules them, and triggers a notification.
- Simple point-and-click interface to confirm, cancel, or reschedule appointments.

### 3. Multilingual Reminder System (Simulation Mode)
- Built-in simulation mode perfect for safe, offline demos.
- Click "Send via WhatsApp" or "Send via SMS" to see a beautiful, pixel-perfect UI preview of the exact message on an iOS/Android style device frame directly in the browser.
- **Language Aware:** Automatically translates the reminder into the patient's preferred language (**English**, **Hindi**, or **Marathi**).
- Simulating a send updates the global state to track it as "Delivered" on the dashboard.

### 4. Voice-Activated AI Booking (Marathi, Hindi & English)
- Integrated with the **Google Gemini Pro API** and the **Web Speech API**.
- The receptionist can click the microphone widget and speak naturally: *"Amit Kumar chi udya chi appointment book kara"* (Book Amit Kumar's appointment for tomorrow).
- The system extracts the intent and pre-fills the booking modal automatically.

### 5. Persistent Global State Management
- Built entirely on **Zustand** with local storage persistence.
- State is instantly synchronized across the Dashboard, the comprehensive Appointments table, and the Patients directory.
- `useAuthStore` ensures the user remains securely logged into their role (Receptionist, Doctor, Patient) across page refreshes.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS, `shadcn/ui` components
- **State Management:** Zustand (with `persist` middleware)
- **Routing:** React Router v6
- **AI Integration:** `@google/generative-ai` (Gemini Pro)
- **Database/Auth Hooks:** Supabase
- **Icons:** Lucide React
- **Date Handling:** `date-fns`

---

## 🚀 Getting Started

To run this project locally:

### 1. Clone & Install
```bash
git clone https://github.com/AdityaFandate/clinic-flow.git
cd clinic-flow
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and add the following keys. You will need a Google Gemini API Key for the voice assistant.
```env
# Google Gemini API Key
VITE_GEMINI_API_KEY="your_gemini_api_key_here"

# Supabase Keys (If connecting to a live database)
VITE_SUPABASE_URL="your_supabase_url_here"
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY="your_supabase_anon_key_here"
```

### 3. Run Development Server
```bash
npm run dev
```
The application will start on `http://localhost:8080`.

### 4. Demo Login Credentials
To bypass the Supabase live auth for the demo, the application uses intelligent mock accounts. Select your role on the login screen to enter the respective dashboard.
- **Receptionist View:** Full access to Dashboard, Appointments, Patients directory, and Reminders.
- **Doctor View:** Access to Daily Schedule and Patient Profiles.
- **Patient View:** Access to personal upcoming appointments.

---

## 🎨 UI/UX Design System
The UI was meticulously crafted to ensure that clinical staff require **zero training** to use it.
- Uses dynamic, responsive `shadcn` components.
- Interactive hover states, sleek modals, and a cohesive `zinc/slate` color palette.
- Realistic device mockups built purely in Tailwind CSS/React for the Messaging Preview modal.

---

Built with ❤️ for better healthcare management.
