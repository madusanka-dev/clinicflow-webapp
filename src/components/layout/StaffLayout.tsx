import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Monitor,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function StaffLayout() {
  const { user, logout, role } = useAuthStore()
  const navigate                = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  function handleLogout() {
    logout()
    navigate('/staff/login')
  }

  const receptionistLinks = [
    { to: '/receptionist/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
    { to: '/receptionist/appointments', label: 'Appointments', icon: CalendarDays },
    { to: '/receptionist/patients',     label: 'Patients',     icon: Users },
  ]

  const doctorLinks = [
    { to: '/doctor/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
    { to: '/doctor/consultations', label: 'Consultations', icon: ClipboardList },
    { to: '/doctor/patients',      label: 'Patient History', icon: Users },
  ]

  const links = role === 'doctor' ? doctorLinks : receptionistLinks

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar */}
      <aside className={cn(
        'flex flex-col bg-slate-900 text-white transition-all duration-300 shrink-0',
        sidebarOpen ? 'w-60' : 'w-16'
      )}>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-sm shrink-0">
            C
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-sm truncate">Clinic System</span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        

        {/* User info + logout */}
        <div className="px-2 py-4 border-t border-slate-700 space-y-2">
          {/* Queue display link — only for receptionist */}
          {role === 'receptionist' && (
            <div className="px-2 pb-2">
              
                <a href="http://127.0.0.1:8000/queue"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  'text-slate-400 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Monitor className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>Queue Display</span>}
              </a>
            </div>
          )}
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-teal-600 text-white text-xs">
                  {user?.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full',
              'text-slate-400 hover:bg-slate-800 hover:text-white transition-colors'
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-500 hover:text-slate-700"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1" />
          <span className="text-sm text-slate-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric',
              month: 'long', day: 'numeric'
            })}
          </span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

      </div>
    </div>
  )
}