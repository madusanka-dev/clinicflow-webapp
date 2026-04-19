import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Users, Clock, CheckCircle, Monitor, ExternalLink } from 'lucide-react'
import { formatTime, getStatusColor, getStatusLabel } from '@/lib/utils'
import type { Appointment } from '@/types'

export default function ReceptionistDashboard() {
  const today = new Date().toISOString().split('T')[0]

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', today],
    queryFn: async () => {
      const res = await api.get(`/staff/appointments?date=${today}`)
      return res.data as Appointment[]
    },
    refetchInterval: 30000, // auto refresh every 30s
  })

  const waiting        = appointments.filter(a => a.status === 'waiting').length
  const inConsultation = appointments.filter(a => a.status === 'in_consultation').length
  const completed      = appointments.filter(a => a.status === 'completed').length
  const total          = appointments.length

  const stats = [
    { label: 'Total Today',      value: total,          icon: CalendarDays, color: 'text-blue-600',  bg: 'bg-blue-50'  },
    { label: 'Waiting',          value: waiting,        icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'In Consultation',  value: inConsultation, icon: Users,        color: 'text-teal-600',  bg: 'bg-teal-50'  },
    { label: 'Completed',        value: completed,      icon: CheckCircle,  color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm bg-slate-900 text-white">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">Queue Display Screen</p>
            <p className="text-xs text-slate-400">
              Open on clinic TV or waiting room screen
            </p>
          </div>
        </div>
        
          <a href="http://127.0.0.1:8000/queue"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Open Queue
          </Button>
        </a>
      </CardContent>
    </Card>

      {/* Today's appointments */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Today's Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No appointments today
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-14 text-center">
                    <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                      {apt.token_number}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {apt.patient?.name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatTime(apt.slot_start)} — {formatTime(apt.slot_end)}
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