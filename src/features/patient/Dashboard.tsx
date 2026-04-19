import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '@/lib/api'
import { useAuthStore } from '@/app/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatTime, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils'
import type { Appointment } from '@/types'
import { CalendarDays, Clock, PlusCircle, CheckCircle } from 'lucide-react'

export default function PatientDashboard() {
  const { patient } = useAuthStore()

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['patient-appointments'],
    queryFn: async () => {
      const res = await api.get('/patient/appointments')
      return res.data as Appointment[]
    },
  })

  const upcoming  = appointments.filter(a =>
    ['waiting', 'pre_booked'].includes(a.status)
  )
  const completed = appointments.filter(a => a.status === 'completed').length

  const next = upcoming[0]

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Hello, {patient?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{upcoming.length}</p>
            <p className="text-xs text-slate-500 mt-1">Upcoming</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{completed}</p>
            <p className="text-xs text-slate-500 mt-1">Completed</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 text-center">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {appointments.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Next appointment */}
      {next && (
        <Card className="border-0 shadow-sm border-l-4 border-l-teal-500">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-3">
              Next Appointment
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {next.token_number}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {formatDate(next.appointment_date)} at {formatTime(next.slot_start)}
                </p>
              </div>
              <Badge className={getStatusColor(next.status)}>
                {getStatusLabel(next.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/patient/book">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                <PlusCircle className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Book Appointment</p>
                <p className="text-xs text-slate-400">Schedule a visit</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/patient/appointments">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">My Appointments</p>
                <p className="text-xs text-slate-400">View history</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent appointments */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-800">Recent Appointments</p>
          </div>
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-slate-400 text-sm">No appointments yet</p>
              <Link to="/patient/book">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Book your first appointment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md w-16 text-center shrink-0">
                    {apt.token_number}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {formatDate(apt.appointment_date)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatTime(apt.slot_start)}
                    </p>
                  </div>
                  <Badge className={`text-xs ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}