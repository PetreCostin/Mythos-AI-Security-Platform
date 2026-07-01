import { LoaderCircle } from 'lucide-react'

interface LoadingSpinnerProps {
  label?: string
  className?: string
}

export function LoadingSpinner({ label = 'Loading', className }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center gap-3 text-slate-300 ${className ?? ''}`}>
      <LoaderCircle className="h-5 w-5 animate-spin text-cyan-400" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
