import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatTime, getStatusColor, getStatusLabel } from "@/lib/utils";
import type { Appointment, Patient, Slot } from "@/types";
import { Plus, RefreshCw, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";

export default function ReceptionistAppointments() {
  const queryClient = useQueryClient();

  // date as Date object now
  const [date, setDate] = useState<Date>(new Date())
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [dialogDatePickerOpen, setDialogDatePickerOpen] = useState(false)

  const [open, setOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [appointmentType, setAppointmentType] = useState<"walk_in" | "pre_booked">("pre_booked");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // yyyy-MM-dd string for API calls
  const dateString = format(date, "yyyy-MM-dd");

  // Fetch appointments for selected date
  const {
    data: appointments = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["appointments", dateString],
    queryFn: async () => {
      const res = await api.get(`/staff/appointments?date=${dateString}`);
      return res.data as Appointment[];
    },
  });

  // Fetch patients for dropdown
  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const res = await api.get("/staff/patients");
      return res.data as Patient[];
    },
  });

  // Fetch available slots
  const { data: slotsData } = useQuery({
    queryKey: ["slots", dateString],
    queryFn: async () => {
      const res = await api.get(`/staff/slots/${dateString}`);
      return res.data;
    },
    enabled: open,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Update status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.put(`/staff/appointments/${id}/status`, { status });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["appointments", dateString] }),
  });

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async () => {
      await api.post("/staff/appointments", {
        patient_id: parseInt(selectedPatient),
        appointment_date: dateString,
        slot_start: selectedSlot,
        type: appointmentType,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", dateString] });
      queryClient.invalidateQueries({ queryKey: ["slots", dateString] });
      setOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? "Failed to create appointment");
    },
  });

  function resetForm() {
    setSelectedSlot("");
    setSelectedPatient("");
    setAppointmentType("pre_booked");
    setNotes("");
    setError("");
  }

  function changeDate(days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d);
  }

  const slots: Slot[] = slotsData?.slots ?? [];

  const statusActions: Record<string, { label: string; next: string; color: string }> = {
    waiting: {
      label: "Call In",
      next: "in_consultation",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    in_consultation: {
      label: "Complete",
      next: "completed",
      color: "bg-green-500 hover:bg-green-600",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">Manage daily appointments</p>
        </div>
        <Button
          onClick={() => { setOpen(true); resetForm(); }}
          className="bg-teal-600 hover:bg-teal-700 py-4"
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

            {/* Date picker for nav bar */}
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 text-sm font-medium text-slate-800 hover:text-teal-600 transition-colors">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  {format(date, "PPP")}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selected: Date | undefined) => {
                    if (selected) {
                      setDate(selected);
                      setDatePickerOpen(false);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <button
              onClick={() => changeDate(1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDate(new Date())}
              className="text-sm font-medium text-teal-600 hover:underline ml-2"
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
              {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
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
                  <div className="w-16 text-center shrink-0">
                    <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                      {apt.token_number}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {apt.patient?.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatTime(apt.slot_start)} — {formatTime(apt.slot_end)}
                      {" · "}
                      <span className="capitalize">{apt.type.replace("_", " ")}</span>
                    </p>
                  </div>
                  <Badge className={`text-xs shrink-0 ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </Badge>
                  {statusActions[apt.status] && (
                    <Button
                      size="sm"
                      className={`text-xs text-white shrink-0 ${statusActions[apt.status].color}`}
                      onClick={() =>
                        updateStatus.mutate({ id: apt.id, status: statusActions[apt.status].next })
                      }
                      disabled={updateStatus.isPending}
                    >
                      {statusActions[apt.status].label}
                    </Button>
                  )}
                  {["waiting", "pre_booked"].includes(apt.status) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                      onClick={() => updateStatus.mutate({ id: apt.id, status: "cancelled" })}
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
        <DialogContent className="max-w-150!">
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 no-scrollbar overflow-y-auto">
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

            {/* Date — shadcn date picker */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover open={dialogDatePickerOpen} onOpenChange={setDialogDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal text-sm border-slate-200 bg-white hover:bg-slate-50",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selected: Date | undefined) => {
                      if (selected) {
                        setDate(selected);
                        setDialogDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                          ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed"
                          : selectedSlot === slot.time
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-white text-slate-700 border-slate-200 hover:border-teal-400"
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
                disabled={createAppointment.isPending || !selectedPatient || !selectedSlot}
              >
                {createAppointment.isPending ? "Booking..." : "Book Appointment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}