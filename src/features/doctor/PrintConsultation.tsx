import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { Consultation } from '@/types'

interface ClinicSettings {
  clinic_name: string
  tagline?:    string
  address?:    string
  phone?:      string
  email?:      string
}

export interface Investigation {
  name:    string
  checked: boolean
  notes:   string
}

interface ConsultationWithDetails extends Consultation {
  doctor?: { name: string }
  appointment?: {
    token_number:     string
    appointment_date: string
    slot_start:       string
  }
}

export default function PrintConsultation() {
  const { id } = useParams()
  const [consultation, setConsultation] = useState<ConsultationWithDetails | null>(null)
  const [settings,     setSettings]     = useState<ClinicSettings | null>(null)
  const [loading,      setLoading]       = useState(true)
  const [error,        setError]         = useState('')
  const printTriggered = useRef(false)

  useEffect(() => {
    async function load() {
      try {
        const [consultRes, settingsRes] = await Promise.all([
          api.get(`/staff/consultations/${id}/print`),
          api.get('/clinic/settings'),
        ])
        setConsultation(consultRes.data)
        setSettings(settingsRes.data)
      } catch {
        setError('Failed to load consultation.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // Auto print when loaded
useEffect(() => {
  if (!loading && consultation && settings && !printTriggered.current) {
    printTriggered.current = true
    setTimeout(() => window.print(), 800)
  }
}, [loading, consultation, settings])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  if (error || !consultation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error || 'Consultation not found.'}</p>
      </div>
    )
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
          @page {
            size: A4;
            margin: 20mm;
          }
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f8fafc;
        }
        .prescription {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          min-height: 100vh;
        }
      `}</style>

      {/* Print button — hidden when printing */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={() => window.print()}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 flex items-center gap-2"
        >
          🖨️ Print / Save PDF
        </button>
        <button
          onClick={() => window.close()}
          className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-300"
        >
          Close
        </button>
      </div>

      <div className="prescription p-10">

        {/* Letterhead */}
        <div className="border-b-2 border-teal-600 pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-teal-700">
                {settings?.clinic_name ?? 'Clinic'}
              </h1>
              {settings?.tagline && (
                <p className="text-sm text-slate-500 mt-0.5">{settings.tagline}</p>
              )}
              <div className="mt-3 space-y-1 text-sm text-slate-500">
                {settings?.address && <p>📍 {settings.address}</p>}
                {settings?.phone   && <p>📞 {settings.phone}</p>}
                {settings?.email   && <p>✉️ {settings.email}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                Consultation Record
              </p>
              <p className="text-sm font-bold text-slate-700 mt-1">
                {consultation.appointment?.token_number}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {consultation.appointment?.appointment_date
                  ? formatDate(consultation.appointment.appointment_date)
                  : '—'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Patient info */}
        <div className="bg-slate-50 rounded-xl p-5 mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Patient Information
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-400">Name</p>
              <p className="text-sm font-semibold text-slate-800">
                {consultation.patient?.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Age</p>
              <p className="text-sm font-semibold text-slate-800">
                {consultation.patient?.age} years
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Gender</p>
              <p className="text-sm font-semibold text-slate-800 capitalize">
                {consultation.patient?.gender ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Phone</p>
              <p className="text-sm font-semibold text-slate-800">
                {consultation.patient?.phone}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Blood Type</p>
              <p className="text-sm font-semibold text-slate-800">
                {consultation.patient?.blood_type ?? '—'}
              </p>
            </div>
            {consultation.patient?.allergies && (
              <div>
                <p className="text-xs text-slate-400">Allergies</p>
                <p className="text-sm font-semibold text-red-600">
                  {consultation.patient.allergies}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Consultation notes */}
        <div className="space-y-5">

          {consultation.symptoms && (
            <div className="border-l-4 border-blue-400 pl-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Symptoms
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {consultation.symptoms}
              </p>
            </div>
          )}

          {consultation.diagnosis && (
            <div className="border-l-4 border-purple-400 pl-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Diagnosis
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {consultation.diagnosis}
              </p>
            </div>
          )}

          {consultation.prescription && (
            <div className="border-l-4 border-teal-500 pl-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Prescription
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {consultation.prescription}
              </p>
            </div>
          )}

          {consultation.investigations && consultation.investigations.length > 0 && (
            <div className="border-l-4 border-yellow-400 pl-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Investigations Requested
                </p>
                <div className="space-y-1.5">
                {consultation.investigations.map((inv: any, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                    <span className="text-teal-600 mt-0.5">✓</span>
                    <div>
                        <p className="text-sm font-medium text-slate-700">{inv.name}</p>
                        {inv.notes && (
                        <p className="text-xs text-slate-500">{inv.notes}</p>
                        )}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}

          {consultation.notes && (
            <div className="border-l-4 border-orange-400 pl-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Additional Notes
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {consultation.notes}
              </p>
            </div>
          )}

          {consultation.follow_up_date && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">
                Follow Up Date
              </p>
              <p className="text-base font-bold text-teal-700">
                {formatDate(consultation.follow_up_date)}
              </p>
            </div>
          )}

        </div>

        {/* Doctor signature */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-end">
          <div>
            <p className="text-xs text-slate-400">Consulting Doctor</p>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {consultation.doctor?.name ?? '—'}
            </p>
          </div>
          <div className="text-right">
            <div className="border-b border-slate-300 w-40 mb-1" />
            <p className="text-xs text-slate-400">Signature</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-300">
            {settings?.clinic_name} · Generated on {new Date().toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>

      </div>
    </>
  )
}