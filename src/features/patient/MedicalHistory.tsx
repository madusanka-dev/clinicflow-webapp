import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  formatTime,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import type { Appointment, Investigation } from "@/types";
import { FileText, Calendar, FlaskConical } from "lucide-react";

export default function PatientMedicalHistory() {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["patient-appointments"],
    queryFn: async () => {
      const res = await api.get("/patient/appointments");
      return res.data as Appointment[];
    },
  });

  const completed = appointments.filter((a) => a.status === "completed");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Medical History</h1>
        <p className="text-slate-500 text-sm mt-1">
          Your past consultations and prescriptions
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : completed.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12 text-slate-400">
            No consultation history yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {completed.map((apt) => (
            <Card key={apt.id} className="border-0 shadow-sm">
              <CardContent className="p-0">
                {/* Appointment header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700">
                    {formatDate(apt.appointment_date)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatTime(apt.slot_start)}
                  </span>
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded ml-auto">
                    {apt.token_number}
                  </span>
                  <Badge className={`text-xs ${getStatusColor(apt.status)}`}>
                    {getStatusLabel(apt.status)}
                  </Badge>
                </div>

                {/* Consultation notes */}
                {apt.consultation ? (
                  <div className="px-5 py-4 space-y-4">
                    {apt.consultation.symptoms && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                          Symptoms
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {apt.consultation.symptoms}
                        </p>
                      </div>
                    )}

                    {apt.consultation.diagnosis && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                          Diagnosis
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {apt.consultation.diagnosis}
                        </p>
                      </div>
                    )}

                    {apt.consultation.prescription && (
                      <div className="bg-teal-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <FileText className="w-3.5 h-3.5 text-teal-600" />
                          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide">
                            Prescription
                          </p>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                          {apt.consultation.prescription}
                        </p>
                      </div>
                    )}

                    {apt.consultation.investigations &&
                      apt.consultation.investigations.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <FlaskConical className="w-3.5 h-3.5 text-yellow-600" />
                            <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">
                              Investigations Requested
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {apt.consultation.investigations.map(
                              (inv: Investigation, i: number) => (
                                <span
                                  key={i}
                                  className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-1 rounded-md"
                                >
                                  {inv.name}
                                  {inv.notes && (
                                    <span className="text-yellow-500">
                                      {" "}
                                      — {inv.notes}
                                    </span>
                                  )}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {apt.consultation.notes && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                          Notes
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {apt.consultation.notes}
                        </p>
                      </div>
                    )}

                    {apt.consultation.follow_up_date && (
                      <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                        <div>
                          <p className="text-xs text-blue-500 font-semibold">
                            Follow Up
                          </p>
                          <p className="text-sm font-bold text-blue-700">
                            {formatDate(apt.consultation.follow_up_date)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-5 py-4">
                    <p className="text-xs text-slate-400 italic">
                      No consultation notes recorded
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
