import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import type { Patient } from "@/types";
import { Plus, Search, User } from "lucide-react";

const bloodTypes = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

interface PatientForm {
  name: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  blood_type: string;
  allergies: string;
}

const emptyForm: PatientForm = {
  name: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  blood_type: "",
  allergies: "",
};

export default function ReceptionistPatients() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [form, setForm] = useState<PatientForm>(emptyForm);
  const [error, setError] = useState("");

  // Fetch patients
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const res = await api.get("/staff/patients");
      return res.data as Patient[];
    },
  });

  // Create patient
  const createPatient = useMutation({
    mutationFn: async () => {
      await api.post("/staff/patients", {
        ...form,
        age: parseInt(form.age),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setOpen(false);
      setForm(emptyForm);
      setError("");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? "Failed to create patient");
    },
  });

  // Update patient
  const updatePatient = useMutation({
    mutationFn: async () => {
      await api.put(`/staff/patients/${selected?.id}`, {
        ...form,
        age: parseInt(form.age),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      setOpen(false);
      setSelected(null);
      setForm(emptyForm);
      setError("");
    },
    onError: (err: any) => {
      setError(err.response?.data?.message ?? "Failed to update patient");
    },
  });

  function openCreate() {
    setSelected(null);
    setForm(emptyForm);
    setError("");
    setOpen(true);
  }

  function openEdit(patient: Patient) {
    setSelected(patient);
    setForm({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: String(patient.age),
      gender: patient.gender ?? "",
      blood_type: patient.blood_type ?? "",
      allergies: patient.allergies ?? "",
    });
    setError("");
    setOpen(true);
  }

  function handleSubmit() {
    if (selected) {
      updatePatient.mutate();
    } else {
      createPatient.mutate();
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
          <p className="text-slate-500 text-sm mt-1">
            {patients.length} total patients
          </p>
        </div>
        <Button onClick={openCreate} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          New Patient
        </Button>
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
              {search ? "No patients found" : "No patients yet"}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
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
                      {patient.phone} · {patient.email}
                    </p>
                  </div>

                  {/* Age */}
                  <span className="text-sm text-slate-500 shrink-0">
                    {patient.age} yrs
                  </span>

                  {/* Gender */}
                  {patient.gender && (
                    <Badge
                      className={`text-xs shrink-0 ${genderColor[patient.gender] ?? "bg-gray-50 text-gray-700"}`}
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

                  {/* Edit */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-slate-500 shrink-0"
                    onClick={() => openEdit(patient)}
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-150!">
          <DialogHeader>
            <DialogTitle>
              {selected ? "Edit Patient" : "New Patient"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2 no-scrollbar overflow-y-auto">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Full Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Silva"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                  disabled={!!selected}
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0771234567"
                />
              </div>

              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => setForm({ ...form, gender: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Blood Type</Label>
                <Select
                  value={form.blood_type}
                  onValueChange={(v) => setForm({ ...form, blood_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map((bt) => (
                      <SelectItem key={bt} value={bt}>
                        {bt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Allergies</Label>
                <Textarea
                  value={form.allergies}
                  onChange={(e) =>
                    setForm({ ...form, allergies: e.target.value })
                  }
                  rows={2}
                  placeholder="Any known allergies..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-teal-600 hover:bg-teal-700"
                onClick={handleSubmit}
                disabled={
                  createPatient.isPending ||
                  updatePatient.isPending ||
                  !form.name ||
                  !form.phone ||
                  (!selected && !form.email) ||
                  !form.age
                }
              >
                {createPatient.isPending || updatePatient.isPending
                  ? "Saving..."
                  : selected
                    ? "Update Patient"
                    : "Create Patient"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
