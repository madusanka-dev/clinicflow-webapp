import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/app/store'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, CheckCircle, Loader2, User } from 'lucide-react'

export default function PatientProfile() {
  const { patient, setPatientAuth, token } = useAuthStore()

  const [form, setForm] = useState({
    name:                  patient?.name                ?? '',
    phone:                 patient?.phone               ?? '',
    age:                   String(patient?.age          ?? ''),
    gender:                patient?.gender              ?? '',
    password:              '',
    password_confirmation: '',
  })

  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)

  const update = useMutation({
    mutationFn: async () => {
      const payload: Record<string, any> = {
        name:   form.name,
        phone:  form.phone,
        age:    parseInt(form.age),
        gender: form.gender,
      }

      // Only include password if filled
      if (form.password) {
        payload.password              = form.password
        payload.password_confirmation = form.password_confirmation
      }

      const res = await api.put('/patient/profile', payload)
      return res.data
    },
    onSuccess: (data) => {
      // Update store with new patient data
      if (token) {
        setPatientAuth(token, data.patient)
      }
      setSuccess(true)
      setForm((f) => ({ ...f, password: '', password_confirmation: '' }))
      setTimeout(() => setSuccess(false), 3000)
      setError('')
    },
    onError: (err: any) => {
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0] as string[]
        setError(first[0])
      } else {
        setError(err.response?.data?.message ?? 'Update failed.')
      }
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (form.password && form.password !== form.password_confirmation) {
      setError('Passwords do not match.')
      return
    }

    update.mutate()
  }

  return (
    <div className="space-y-6 max-w-lg">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">
          Update your personal information
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
          <User className="w-8 h-8 text-teal-600" />
        </div>
        <div>
          <p className="font-semibold text-slate-800">{patient?.name}</p>
          <p className="text-sm text-slate-400">{patient?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Profile updated successfully!
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Personal info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Silva"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={patient?.email ?? ''}
                disabled
                className="bg-slate-50 text-slate-400"
              />
              <p className="text-xs text-slate-400">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="0771234567"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setForm({ ...form, gender: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </CardContent>
        </Card>

        {/* Change password */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-400">
              Leave blank to keep your current password
            </p>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700"
          disabled={update.isPending}
        >
          {update.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {update.isPending ? 'Saving...' : 'Save Changes'}
        </Button>

      </form>
    </div>
  )
}