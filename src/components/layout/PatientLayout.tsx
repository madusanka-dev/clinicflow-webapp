import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { CalendarDays, LayoutDashboard, LogOut, PlusCircle, UserCircle, History  } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PatientLayout() {
  const { patient, logout } = useAuthStore()
  const navigate             = useNavigate()

  function handleLogout() {
    logout()
    navigate('/patient/login')
  }

  const links = [
    { to: '/patient/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/patient/appointments', label: 'My Appointments', icon: CalendarDays },
    { to: '/patient/book',         label: 'Book Appointment', icon: PlusCircle },
    { to: '/patient/history',      label: 'Medical History',  icon: History },
    { to: '/patient/profile',      label: 'My Profile',       icon: UserCircle },
  ]

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar */}
      <aside className="flex flex-col bg-teal-700 text-white w-60 shrink-0">

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-teal-600">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-teal-700 text-sm shrink-0">
            C
          </div>
          <span className="font-semibold text-sm">Patient Portal</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-teal-800 text-white'
                  : 'text-teal-100 hover:bg-teal-600 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-2 py-4 border-t border-teal-600 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-teal-500 text-white text-xs">
                {patient?.name?.charAt(0) ?? 'P'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{patient?.name}</p>
              <p className="text-xs text-teal-200">Patient</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-teal-100 hover:bg-teal-600 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
          <span className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric'
            })}
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

    </div>
  )
}