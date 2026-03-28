import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'suffix'> {
  prefix?: React.ReactNode
  suffix?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefix, suffix, ...props }, ref) => {
    if (prefix || suffix) {
      return (
        <div className="relative flex items-center">
          {prefix && (
            <div className="absolute left-3 text-slate-400 text-sm pointer-events-none">{prefix}</div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-xl border border-border bg-white px-4 py-2 text-sm text-slate-900',
              'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pilot-600/20 focus:border-pilot-600',
              'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150',
              prefix && 'pl-8',
              suffix && 'pr-8',
              className
            )}
            ref={ref}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 text-slate-400 text-sm pointer-events-none">{suffix}</div>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-border bg-white px-4 py-2 text-sm text-slate-900',
          'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pilot-600/20 focus:border-pilot-600',
          'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
