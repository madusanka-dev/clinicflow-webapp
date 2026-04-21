import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  formatDate,
  formatTime,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import type { Appointment } from "@/types";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

export default function PatientAppointments() {
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["patient-appointments"],
    queryFn: async () => {
      const res = await api.get("/patient/appointments");
      return res.data as Appointment[];
    },
  });

  const cancel = useMutation({
    mutationFn: async (id: number) => {
      await api.put(`/patient/appointments/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
    },
  });

  const upcoming = appointments.filter((a) =>
    ["waiting", "pre_booked"].includes(a.status),
  );
  const past = appointments.filter(
    (a) => !["waiting", "pre_booked"].includes(a.status),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Appointments</h1>
          <p className="text-slate-500 text-sm mt-1">
            {appointments.length} total appointments
          </p>
        </div>
        <Link to="/patient/book">
          <Button className="bg-teal-600 hover:bg-teal-700">
            <PlusCircle className="w-4 h-4 mr-2" />
            Book New
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Loading...</div>
      ) : appointments.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12 space-y-3">
            <p className="text-slate-400">No appointments yet</p>
            <Link to="/patient/book">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                Book your first appointment
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Upcoming — {upcoming.length}
              </h2>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {upcoming.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center gap-4 px-5 py-4"
                      >
                        <span className="text-sm font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded-md w-16 text-center shrink-0">
                          {apt.token_number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            {formatDate(apt.appointment_date)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatTime(apt.slot_start)} —{" "}
                            {formatTime(apt.slot_end)}
                          </p>
                        </div>
                        <Badge
                          className={`text-xs ${getStatusColor(apt.status)}`}
                        >
                          {getStatusLabel(apt.status)}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                          onClick={() => cancel.mutate(apt.id)}
                          disabled={cancel.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Past — {past.length}
              </h2>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {past.map((apt) => (
                      <div
                        key={apt.id}
                        className="flex items-center gap-4 px-5 py-4"
                      >
                        <span className="text-sm font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md w-16 text-center shrink-0">
                          {apt.token_number}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-600">
                            {formatDate(apt.appointment_date)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatTime(apt.slot_start)} —{" "}
                            {formatTime(apt.slot_end)}
                          </p>
                        </div>
                        <Badge
                          className={`text-xs ${getStatusColor(apt.status)}`}
                        >
                          {getStatusLabel(apt.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
