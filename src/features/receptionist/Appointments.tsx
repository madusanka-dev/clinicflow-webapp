import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatTime, getStatusColor, getStatusLabel } from '@/lib/utils'
import type { Appointment, Patient, Slot } from '@/types'
import { Plus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ReceptionistAppointments() {
  const queryClient = useQueryClient()
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0])
  const [open, setOpen]         = useState(false)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [selectedPatient, setSelectedPatient] = useState('')
  const [appointmentType, setAppointmentType] = useState<'walk_in' | 'pre_booked'>('pre_booked')
  const [notes, setNotes]       = useState('')
  const [error, setError]       = useState('')

  // Fetch appointments for selected date
  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['appointments', date],
    queryFn: async () => {
      const res = await api.get(`/staff/appointments?date=${date}`)
      return res.data as Appointment[]
    },
  })

  // Fetch patients for dropdown
  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const res = await api.get('/staff/patients')
      return res.data as Patient[]
    },
  })

  // Fetch available slots
  const { data: slotsData } = useQuery({
    queryKey: ['slots', date],
    queryFn: async () => {
      const res = await api.get(`/staff/slots/${date}`)
      return res.data
    },
    enabled: open,
    staleTime: 0,
    refetchOnMount: true,
  })

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.put(`/staff/appointments/${id}/status`, { status })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments', date] }),
  })

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async () => {
      await api.post('/staff/appointments', {
        patient_id:       parseInt(selectedPatient),
        appointment_date: date,
        slot_start:       selectedSlot,
        type:             appointmentType,
        notes,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', date] })
      queryClient.invalidateQueries({ queryKey: ['slots', date] })
      setOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? 'Failed to create appointment')
    },
  })

  function resetForm() {
    setSelectedSlot('')
    setSelectedPatient('')
    setAppointmentType('pre_booked')
    setNotes('')
    setError('')
  }

  function changeDate(days: number) {
    const d = new Date(date)
    d.setDate(d.getDate() + days)
    setDate(d.toISOString().split('T')[0])
  }

  const slots: Slot[] = slotsData?.slots ?? []

  const statusActions: Record<string, { label: string; next: string; color: string }> = {
    waiting:         { label: 'Call In',   next: 'in_consultation', color: 'bg-blue-500 hover:bg-blue-600'   },
    in_consultation: { label: 'Complete',  next: 'completed',       color: 'bg-green-500 hover:bg-green-600' },
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">Manage daily appointments</p>
        </div>
        <Button
          onClick={() => { setOpen(true); resetForm() }}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Date navigation */}
      <Card className="border-0 shadow-sm">
        <CardContent className="py-3 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeDate(-1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm font-medium text-slate-800 border-0 outline-none bg-transparent"
            />
            <button
              onClick={() => changeDate(1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDate(new Date().toISOString().split('T')[0])}
              className="text-xs text-teal-600 hover:underline ml-2"
            >
              Today
            </button>
            <div className="flex-1" />
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-500">
              {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Appointments list */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No appointments for this date
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50"
                >
                  {/* Token */}
                  <div className="w-16 text-center shrink-0">
                    <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                      {apt.token_number}
                    </span>
                  </div>

                  {/* Patient info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {apt.patient?.name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatTime(apt.slot_start)} — {formatTime(apt.slot_end)}
                      {' · '}
                      <span className="capitalize">{apt.type.replace('_', ' ')}</span>
                    </p>
                  </div>

                  {/* Status badge */}
                  <Badge className={`text-xs shrink-0 ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </Badge>

                  {/* Action button */}
                  {statusActions[apt.status] && (
                    <Button
                      size="sm"
                      className={`text-xs text-white shrink-0 ${statusActions[apt.status].color}`}
                      onClick={() => updateStatus.mutate({
                        id: apt.id,
                        status: statusActions[apt.status].next,
                      })}
                      disabled={updateStatus.isPending}
                    >
                      {statusActions[apt.status].label}
                    </Button>
                  )}

                  {/* Cancel button */}
                  {['waiting', 'pre_booked'].includes(apt.status) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                      onClick={() => updateStatus.mutate({ id: apt.id, status: 'cancelled' })}
                      disabled={updateStatus.isPending}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Appointment Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Patient */}
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name} — {p.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={appointmentType}
                onValueChange={(v) => setAppointmentType(v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre_booked">Pre Booked</SelectItem>
                  <SelectItem value="walk_in">Walk In</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time slot */}
            <div className="space-y-2">
              <Label>Time Slot</Label>
              {!slotsData ? (
                <p className="text-sm text-slate-400">Loading slots...</p>
              ) : !slotsData.available ? (
                <p className="text-sm text-red-500">{slotsData.message}</p>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`
                        text-xs py-2 px-1 rounded-lg border font-medium transition-colors
                        ${!slot.available
                          ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed'
                          : selectedSlot === slot.time
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-400'
                        }
                      `}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Any notes..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => createAppointment.mutate()}
                disabled={
                  createAppointment.isPending ||
                  !selectedPatient ||
                  !selectedSlot
                }
              >
                {createAppointment.isPending ? 'Booking...' : 'Book Appointment'}
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}