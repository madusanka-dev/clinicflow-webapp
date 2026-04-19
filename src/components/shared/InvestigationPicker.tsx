import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'

const INVESTIGATION_GROUPS = [
  {
    group: 'Blood Tests',
    items: [
      'CBC (Full Blood Count)',
      'Blood Sugar — Fasting',
      'Blood Sugar — Random',
      'HbA1c',
      'Lipid Profile',
      'Total Cholesterol',
    ],
  },
  {
    group: 'Liver Function',
    items: [
      'LFT (Liver Function Test)',
      'ALT / SGPT',
      'AST / SGOT',
      'Bilirubin (Total)',
      'Alkaline Phosphatase',
    ],
  },
  {
    group: 'Kidney Function',
    items: [
      'Serum Creatinine',
      'eGFR',
      'BUN (Blood Urea Nitrogen)',
      'Uric Acid',
      'Electrolytes (Na, K, Cl)',
    ],
  },
  {
    group: 'Thyroid',
    items: [
      'TSH',
      'Free T3',
      'Free T4',
    ],
  },
  {
    group: 'Urine Tests',
    items: [
      'Urine Full Report (UFR)',
      'Urine Culture & Sensitivity',
      'Urine Microalbumin',
      'Urine Creatinine',
    ],
  },
  {
    group: 'Imaging & Other',
    items: [
      'Chest X-Ray',
      'ECG',
      'Ultrasound — Abdomen',
      'Ultrasound — Pelvis',
      'Echocardiogram',
      'CT Scan',
      'MRI',
    ],
  },
]

interface InvestigationPickerProps {
  value:    Record<string, { checked: boolean; notes: string }>
  onChange: (value: Record<string, { checked: boolean; notes: string }>) => void
}

export default function InvestigationPicker({ value, onChange }: InvestigationPickerProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Blood Tests': true,
  })

  function toggleGroup(group: string) {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }))
  }

  function toggleItem(item: string) {
    const current = value[item]
    if (current?.checked) {
      // Uncheck — remove from value
      const next = { ...value }
      delete next[item]
      onChange(next)
    } else {
      onChange({
        ...value,
        [item]: { checked: true, notes: current?.notes ?? '' },
      })
    }
  }

  function updateNotes(item: string, notes: string) {
    onChange({
      ...value,
      [item]: { checked: true, notes },
    })
  }

  const checkedCount = Object.keys(value).length

  return (
    <div className="space-y-2">

      {checkedCount > 0 && (
        <div className="flex flex-wrap gap-1.5 p-3 bg-teal-50 rounded-lg">
          {Object.keys(value).map((item) => (
            <span
              key={item}
              className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-md font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      )}

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        {INVESTIGATION_GROUPS.map(({ group, items }) => (
          <div key={group} className="border-b border-slate-100 last:border-0">

            {/* Group header */}
            <button
              type="button"
              onClick={() => toggleGroup(group)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">{group}</span>
              <div className="flex items-center gap-2">
                {items.filter(i => value[i]?.checked).length > 0 && (
                  <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                    {items.filter(i => value[i]?.checked).length} selected
                  </span>
                )}
                {openGroups[group]
                  ? <ChevronUp className="w-4 h-4 text-slate-400" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />
                }
              </div>
            </button>

            {/* Group items */}
            {openGroups[group] && (
              <div className="px-4 pb-3 space-y-2">
                {items.map((item) => {
                  const checked = !!value[item]?.checked
                  return (
                    <div key={item} className="space-y-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleItem(item)}
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 accent-teal-600 cursor-pointer"
                        />
                        <span className={cn(
                          'text-sm transition-colors',
                          checked ? 'text-teal-700 font-medium' : 'text-slate-600'
                        )}>
                          {item}
                        </span>
                      </label>

                      {/* Notes input when checked */}
                      {checked && (
                        <div className="ml-7">
                          <input
                            type="text"
                            placeholder="Add notes (optional)..."
                            value={value[item]?.notes ?? ''}
                            onChange={(e) => updateNotes(item, e.target.value)}
                            className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  )
}