import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User, Patient } from '@/types'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token:   null,
      user:    null,
      patient: null,
      role:    null,

      setStaffAuth: (token: string, user: User) => {
        localStorage.setItem('token', token)
        set({ token, user, role: user.role, patient: null })
      },

      setPatientAuth: (token: string, patient: Patient) => {
        localStorage.setItem('token', token)
        set({ token, patient, role: 'patient', user: null })
      },

      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null, patient: null, role: null })
      },
    }),
    {
      name: 'clinic-auth',
    }
  )
)