import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: string): string {
  if (!time) return ''
  return time.substring(0, 5)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'waiting':         return 'bg-yellow-100 text-yellow-800'
    case 'in_consultation': return 'bg-blue-100 text-blue-800'
    case 'completed':       return 'bg-green-100 text-green-800'
    case 'cancelled':       return 'bg-red-100 text-red-800'
    case 'no_show':         return 'bg-gray-100 text-gray-800'
    default:                return 'bg-gray-100 text-gray-800'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'waiting':         return 'Waiting'
    case 'in_consultation': return 'In Consultation'
    case 'completed':       return 'Completed'
    case 'cancelled':       return 'Cancelled'
    case 'no_show':         return 'No Show'
    default:                return status
  }
}