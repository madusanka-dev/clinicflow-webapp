export interface User {
  id: number
  name: string
  email: string
  role: 'doctor' | 'receptionist'
  phone?: string
  avatar?: string
  is_active: boolean
}

export interface Patient {
  id: number
  name: string
  email: string
  phone: string
  age: number
  gender?: 'male' | 'female' | 'other'
  blood_type?: string
  allergies?: string
  notes?: string
}

export interface Appointment {
  id: number
  patient_id: number
  patient?: Patient
  booked_by?: number
  appointment_date: string
  slot_start: string
  slot_end: string
  token_number: string
  type: 'walk_in' | 'pre_booked'
  status: 'waiting' | 'in_consultation' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  consultation?: Consultation 
}

export interface Investigation {
  name:   string
  checked: boolean
  notes:  string
}

export interface Consultation {
  id: number
  appointment_id: number
  patient_id: number
  patient?: Patient
  created_by: number
  symptoms?: string
  diagnosis?: string
  prescription?: string
  investigations?: Investigation[]
  notes?: string
  follow_up_date?: string
}

export interface Slot {
  time: string
  available: boolean
}

export interface AuthState {
  token: string | null
  user: User | null
  patient: Patient | null
  role: 'doctor' | 'receptionist' | 'patient' | null
  setStaffAuth: (token: string, user: User) => void
  setPatientAuth: (token: string, patient: Patient) => void
  logout: () => void
}