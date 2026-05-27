import { AlertCircle } from 'lucide-react'

export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
    <AlertCircle className="h-4 w-4 flex-shrink-0" />
    {message}
  </div>
)
