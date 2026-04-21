import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatDate,
  formatTime,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import type {
  Patient,
  Appointment,
  Consultation,
  Investigation,
} from "@/types";
import {
  Search,
  User,
  ChevronRight,
  Calendar,
  FileText,
  Printer,
} from "lucide-react";

interface PatientWithHistory extends Patient {
  appointments: (Appointment & { consultation?: Consultation })[];
}

export default function DoctorPatientHistory() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PatientWithHistory | null>(null);
  const [open, setOpen] = useState(false);

  // Fetch all patients
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const res = await api.get("/staff/patients");
      return res.data as Patient[];
    },
  });

  // Fetch selected patient history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["patient-history", selected?.id],
    queryFn: async () => {
      const res = await api.get(`/staff/patients/${selected?.id}/history`);
      return res.data as PatientWithHistory;
    },
    enabled: !!selected,
  });

  function openHistory(patient: Patient) {
    setSelected(patient as PatientWithHistory);
    setOpen(true);
  }

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search) ||
      p.email.toLowerCase().includes(search.toLowerCase()),
  );

  const genderColor: Record<string, string> = {
    male: "bg-blue-50 text-blue-700",
    female: "bg-pink-50 text-pink-700",
    other: "bg-gray-50 text-gray-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Patient History</h1>
        <p className="text-slate-500 text-sm mt-1">
          View patient records and consultation history
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name, phone or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Patients list */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No patients found
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => openHistory(patient)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-teal-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {patient.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {patient.phone} · {patient.age} yrs
                    </p>
                  </div>

                  {/* Gender */}
                  {patient.gender && (
                    <Badge
                      className={`text-xs shrink-0 ${genderColor[patient.gender]}`}
                    >
                      {patient.gender}
                    </Badge>
                  )}

                  {/* Blood type */}
                  {patient.blood_type && (
                    <Badge className="text-xs shrink-0 bg-red-50 text-red-700">
                      {patient.blood_type}
                    </Badge>
                  )}

                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient History Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              {selected?.name}
            </DialogTitle>
          </DialogHeader>

          {historyLoading ? (
            <div className="text-center py-8 text-slate-400">
              Loading history...
            </div>
          ) : history ? (
            <div className="space-y-5 pt-2 no-scrollbar max-h-[60vh] overflow-y-auto">
              {/* Patient details */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-xl p-4">
                <div>
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="text-sm font-medium text-slate-700">
                    {history.phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {history.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Age</p>
                  <p className="text-sm font-medium text-slate-700">
                    {history.age} years
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Blood Type</p>
                  <p className="text-sm font-medium text-slate-700">
                    {history.blood_type ?? "—"}
                  </p>
                </div>
                {history.allergies && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400">Allergies</p>
                    <p className="text-sm font-medium text-red-600">
                      {history.allergies}
                    </p>
                  </div>
                )}
              </div>

              {/* Appointments & consultations */}
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">
                  Appointment History ({history.appointments?.length ?? 0})
                </p>

                {!history.appointments?.length ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    No appointments found
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="border border-slate-100 rounded-xl overflow-hidden"
                      >
                        {/* Appointment header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50">
                          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-sm font-medium text-slate-700">
                            {formatDate(apt.appointment_date)}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatTime(apt.slot_start)}
                          </span>
                          <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded ml-auto">
                            {apt.token_number}
                          </span>
                          <Badge
                            className={`text-xs ${getStatusColor(apt.status)}`}
                          >
                            {getStatusLabel(apt.status)}
                          </Badge>
                        </div>

                        {/* Consultation notes */}
                        {apt.consultation ? (
                          <div className="px-4 py-3 space-y-2">
                            <div className="flex items-center gap-1 mb-2">
                              <FileText className="w-3.5 h-3.5 text-teal-600" />
                              <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                                Consultation Notes
                              </span>
                            </div>
                            {apt.consultation.symptoms && (
                              <div>
                                <p className="text-xs text-slate-400">
                                  Symptoms
                                </p>
                                <p className="text-sm text-slate-700">
                                  {apt.consultation.symptoms}
                                </p>
                              </div>
                            )}
                            {apt.consultation.diagnosis && (
                              <div>
                                <p className="text-xs text-slate-400">
                                  Diagnosis
                                </p>
                                <p className="text-sm text-slate-700">
                                  {apt.consultation.diagnosis}
                                </p>
                              </div>
                            )}
                            {apt.consultation.prescription && (
                              <div>
                                <p className="text-xs text-slate-400">
                                  Prescription
                                </p>
                                <p className="text-sm text-slate-700">
                                  {apt.consultation.prescription}
                                </p>
                              </div>
                            )}
                            {apt.consultation.investigations &&
                              apt.consultation.investigations.length > 0 && (
                                <div>
                                  <p className="text-xs text-slate-400">
                                    Investigations
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {apt.consultation.investigations.map(
                                      (inv: Investigation, i: number) => (
                                        <span
                                          key={i}
                                          className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-md"
                                        >
                                          {inv.name}
                                          {inv.notes && ` — ${inv.notes}`}
                                        </span>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                            {apt.consultation.follow_up_date && (
                              <div>
                                <p className="text-xs text-slate-400">
                                  Follow Up
                                </p>
                                <p className="text-sm font-medium text-teal-600">
                                  {formatDate(apt.consultation.follow_up_date)}
                                </p>
                              </div>
                            )}
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() =>
                                  window.open(
                                    `/print/consultation/${apt.consultation!.id}`,
                                    "_blank",
                                  )
                                }
                                className="flex items-center gap-1.5 text-xs text-teal-600 hover:underline"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Print Prescription
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="px-4 py-3">
                            <p className="text-xs text-slate-400 italic">
                              No consultation notes
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
