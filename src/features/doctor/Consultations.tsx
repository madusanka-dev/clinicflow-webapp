import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import InvestigationPicker from "@/components/shared/InvestigationPicker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatTime } from "@/lib/utils";
import type { Appointment } from "@/types";
import {
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Printer,
} from "lucide-react";
import { useAuthStore } from "@/app/store";

interface ConsultationForm {
  symptoms: string;
  diagnosis: string;
  prescription: string;
  investigations: Record<string, { checked: boolean; notes: string }>;
  notes: string;
  follow_up_date: string;
}

const emptyForm: ConsultationForm = {
  symptoms: "",
  diagnosis: "",
  prescription: "",
  investigations: {},
  notes: "",
  follow_up_date: "",
};

export default function DoctorConsultations() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [form, setForm] = useState<ConsultationForm>(emptyForm);
  const [error, setError] = useState("");

  // Fetch today's appointments
  const {
    data: appointments = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["appointments", date],
    queryFn: async () => {
      const res = await api.get(`/staff/appointments?date=${date}`);
      return res.data as Appointment[];
    },
    refetchInterval: 30000,
  });

  // Update status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.put(`/staff/appointments/${id}/status`, { status });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["appointments", date] }),
  });

  // Save consultation
  const saveConsultation = useMutation({
    mutationFn: async () => {
      await api.post("/staff/consultations", {
        appointment_id: selected?.id,
        patient_id: selected?.patient_id,
        created_by: user?.id,
        symptoms: form.symptoms,
        diagnosis: form.diagnosis,
        prescription: form.prescription,
        investigations: Object.entries(form.investigations).map(
          ([name, val]) => ({
            name,
            checked: val.checked,
            notes: val.notes,
          }),
        ),
        notes: form.notes,
        follow_up_date: form.follow_up_date || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments", date] });
      // Mark appointment as completed
      if (selected) {
        updateStatus.mutate({ id: selected.id, status: "completed" });
      }
      setOpen(false);
      setForm(emptyForm);
      setError("");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? "Failed to save consultation");
    },
  });

  function openConsultation(apt: Appointment) {
    setSelected(apt);
    setForm(emptyForm);
    setError("");
    setOpen(true);
    // Mark as in_consultation
    updateStatus.mutate({ id: apt.id, status: "in_consultation" });
  }

  function changeDate(days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split("T")[0]);
  }

  const inConsultation = appointments.filter(
    (a) => a.status === "in_consultation",
  );
  const waiting = appointments.filter((a) => a.status === "waiting");
  const completed = appointments.filter((a) => a.status === "completed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Consultations</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage patient consultations
          </p>
        </div>
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
              onClick={() => setDate(new Date().toISOString().split("T")[0])}
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
          </div>
        </CardContent>
      </Card>

      {/* In Consultation */}
      {inConsultation.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            In Consultation
          </h2>
          {inConsultation.map((apt) => (
            <Card
              key={apt.id}
              className="border-0 shadow-sm border-l-4 border-l-blue-500"
            >
              <CardContent className="flex items-center gap-4 py-4 px-5">
                <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
                  {apt.token_number}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {apt.patient?.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatTime(apt.slot_start)}
                  </p>
                </div>
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  In Consultation
                </Badge>
                <Button
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs"
                  onClick={() => openConsultation(apt)}
                >
                  <ClipboardList className="w-4 h-4 mr-1" />
                  Write Notes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Waiting */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Waiting — {waiting.length}
        </h2>
        {isLoading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : waiting.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="text-center py-8 text-slate-400">
              No patients waiting
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {waiting.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50"
                  >
                    <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md w-16 text-center shrink-0">
                      {apt.token_number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {apt.patient?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatTime(apt.slot_start)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs shrink-0"
                      onClick={() => openConsultation(apt)}
                      disabled={updateStatus.isPending}
                    >
                      Call In
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Completed — {completed.length}
          </h2>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {completed.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <span className="text-sm font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md w-16 text-center shrink-0">
                      {apt.token_number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-500 truncate">
                        {apt.patient?.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatTime(apt.slot_start)}
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      Completed
                    </Badge>
                    {/* Print button */}
                    {apt.consultation && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-slate-500 hover:text-teal-600 shrink-0"
                        onClick={() =>
                          window.open(
                            `/print/consultation/${apt.consultation!.id}`,
                            "_blank",
                          )
                        }
                      >
                        <Printer className="w-4 h-4 mr-1" />
                        Print
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Consultation Notes Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-200!">
          <DialogHeader>
            <DialogTitle>
              Consultation — {selected?.patient?.name} ({selected?.token_number}
              )
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 no-scrollbar max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Symptoms</Label>
              <Textarea
                value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                rows={3}
                placeholder="Describe symptoms..."
              />
            </div>

            <div className="space-y-2">
              <Label>Diagnosis</Label>
              <Textarea
                value={form.diagnosis}
                onChange={(e) =>
                  setForm({ ...form, diagnosis: e.target.value })
                }
                rows={3}
                placeholder="Diagnosis..."
              />
            </div>

            <div className="space-y-2">
              <Label>Prescription</Label>
              <Textarea
                value={form.prescription}
                onChange={(e) =>
                  setForm({ ...form, prescription: e.target.value })
                }
                rows={3}
                placeholder="Medications and instructions..."
              />
            </div>

            <div className="space-y-2">
              <Label>Investigations / Lab Reports</Label>
              <InvestigationPicker
                value={form.investigations}
                onChange={(v) => setForm({ ...form, investigations: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Any additional notes..."
              />
            </div>

            <div className="space-y-2">
              <Label>Follow Up Date (optional)</Label>
              <Input
                type="date"
                value={form.follow_up_date}
                onChange={(e) =>
                  setForm({ ...form, follow_up_date: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => saveConsultation.mutate()}
                disabled={
                  saveConsultation.isPending ||
                  !form.symptoms ||
                  !form.diagnosis
                }
              >
                {saveConsultation.isPending ? "Saving..." : "Save & Complete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
