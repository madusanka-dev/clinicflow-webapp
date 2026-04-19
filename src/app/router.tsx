import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store'

// Auth pages
import StaffLogin   from '@/features/auth/StaffLogin'
import PatientLogin from '@/features/auth/PatientLogin'
import PatientRegister from '@/features/auth/PatientRegister'

// Layouts
import StaffLayout   from '@/components/layout/StaffLayout'
import PatientLayout from '@/components/layout/PatientLayout'

// Receptionist pages
import ReceptionistDashboard   from '@/features/receptionist/Dashboard'
import ReceptionistAppointments from '@/features/receptionist/Appointments'
import ReceptionistPatients    from '@/features/receptionist/Patients'

// Doctor pages
import DoctorDashboard    from '@/features/doctor/Dashboard'
import DoctorConsultations from '@/features/doctor/Consultations'
import DoctorPatientHistory from '@/features/doctor/PatientHistory'
import PrintConsultation from '@/features/doctor/PrintConsultation'

// Patient pages
import PatientDashboard      from '@/features/patient/Dashboard'
import PatientAppointments   from '@/features/patient/MyAppointments'
import BookAppointment       from '@/features/patient/BookAppointment'
import PatientProfile from '@/features/patient/Profile'
import PatientMedicalHistory from '@/features/patient/MedicalHistory'

// Guards
function StaffGuard({ children }: { children: React.ReactNode }) {
  const { token, role } = useAuthStore()
  if (!token) return <Navigate to="/staff/login" replace />
  if (role === 'patient') return <Navigate to="/patient/dashboard" replace />
  return <>{children}</>
}

function DoctorGuard({ children }: { children: React.ReactNode }) {
  const { token, role } = useAuthStore()
  if (!token) return <Navigate to="/staff/login" replace />
  if (role !== 'doctor') return <Navigate to="/receptionist/dashboard" replace />
  return <>{children}</>
}

function PatientGuard({ children }: { children: React.ReactNode }) {
  const { token, role } = useAuthStore()
  if (!token) return <Navigate to="/patient/login" replace />
  if (role !== 'patient') return <Navigate to="/staff/login" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  // Default redirect
  { path: '/', element: <Navigate to="/staff/login" replace /> },

  // Staff auth
  { path: '/staff/login', element: <StaffLogin /> },

  // Patient auth
  { path: '/patient/login',    element: <PatientLogin /> },
  { path: '/patient/register', element: <PatientRegister /> },

  // Receptionist routes
  {
    path: '/receptionist',
    element: <StaffGuard><StaffLayout /></StaffGuard>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',    element: <ReceptionistDashboard /> },
      { path: 'appointments', element: <ReceptionistAppointments /> },
      { path: 'patients',     element: <ReceptionistPatients /> },
    ],
  },

  // Doctor routes
  {
    path: '/doctor',
    element: <DoctorGuard><StaffLayout /></DoctorGuard>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',     element: <DoctorDashboard /> },
      { path: 'consultations', element: <DoctorConsultations /> },
      { path: 'patients', element: <DoctorPatientHistory /> },
    ],
  },

  { path: '/print/consultation/:id', element: <PrintConsultation /> },

  // Patient routes
  {
    path: '/patient',
    element: <PatientGuard><PatientLayout /></PatientGuard>,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard',    element: <PatientDashboard /> },
      { path: 'appointments', element: <PatientAppointments /> },
      { path: 'book',         element: <BookAppointment /> },
      { path: 'profile', element: <PatientProfile /> },
      { path: 'history', element: <PatientMedicalHistory /> },
    ],
  },
])