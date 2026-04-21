import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Slot } from "@/types";
import { AlertCircle, CheckCircle, Loader2, CalendarIcon } from "lucide-react";

export default function BookAppointment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [open, setOpen] = useState(false);

  // Convert Date to yyyy-MM-dd string for API calls
  const dateString = date ? format(date, "yyyy-MM-dd") : "";

  // Fetch available slots
  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ["patient-slots", dateString],
    queryFn: async () => {
      const res = await api.get(`/staff/slots/${dateString}`);
      return res.data;
    },
    enabled: !!dateString,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Book appointment
  const book = useMutation({
    mutationFn: async () => {
      await api.post("/patient/appointments", {
        appointment_date: dateString,
        slot_start: selectedSlot,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-appointments"] });
      setSuccess(true);
      setTimeout(() => navigate("/patient/appointments"), 2000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? "Booking failed.");
    },
  });

  const slots: Slot[] = slotsData?.slots ?? [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Appointment Booked!
          </h2>
          <p className="text-slate-500 text-sm">
            Redirecting to your appointments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Book Appointment</h1>
        <p className="text-slate-500 text-sm mt-1">
          Choose a date and available time slot
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white hover:bg-slate-50",
                  !date && "text-slate-400",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selected: Date | undefined) => {
                  setDate(selected);
                  setSelectedSlot("");
                  setError("");
                  setOpen(false);
                }}
                disabled={(d: Date) => d < today}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {/* Slots */}
      {date && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Available Slots</CardTitle>
          </CardHeader>
          <CardContent>
            {slotsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : !slotsData?.available ? (
              <div className="text-center py-6 text-slate-400">
                <p>{slotsData?.message ?? "No slots available"}</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                No slots available for this date
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => {
                      setSelectedSlot(slot.time);
                      setError("");
                    }}
                    className={`
                      text-sm py-2.5 px-2 rounded-lg border font-medium transition-colors
                      ${
                        !slot.available
                          ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed"
                          : selectedSlot === slot.time
                            ? "bg-teal-600 text-white border-teal-600"
                            : "bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:text-teal-600"
                      }
                    `}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Submit */}
      {selectedSlot && (
        <Button
          className="w-full bg-teal-600 hover:bg-teal-700"
          onClick={() => book.mutate()}
          disabled={book.isPending}
        >
          {book.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {book.isPending ? "Booking..." : `Book at ${selectedSlot}`}
        </Button>
      )}
    </div>
  );
}
