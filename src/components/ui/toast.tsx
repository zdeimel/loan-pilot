'use client'

import { useEffect } from 'react'
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={cn(
      'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in slide-in-from-bottom-2 duration-200',
      type === 'success' && 'bg-emerald-50 border-emerald-200 text-emerald-800',
      type === 'error'   && 'bg-red-50 border-red-200 text-red-800',
      type === 'info'    && 'bg-blue-50 border-blue-200 text-blue-800',
    )}>
      {type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
      {type === 'error'   && <AlertCircle  className="w-4 h-4 text-red-600 flex-shrink-0" />}
      {type === 'info'    && <Info         className="w-4 h-4 text-blue-600 flex-shrink-0" />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
