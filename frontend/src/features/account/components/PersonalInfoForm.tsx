import { useState } from 'react'
import { useAuth } from '@/core/auth/useAuth'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'

export const PersonalInfoForm = () => {
  const { user } = useAuth()
  const [email] = useState(user?.email ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {saved && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Información actualizada correctamente
        </div>
      )}
      <Input
        id="email"
        label="Correo electrónico"
        type="email"
        value={email}
        readOnly
        className="bg-gray-50 cursor-not-allowed"
      />
      <p className="text-xs text-gray-400">El correo electrónico no puede ser modificado.</p>
      <Input
        id="phone"
        label="Teléfono"
        type="tel"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="+51 987 654 321"
      />
      <Button type="submit">Guardar</Button>
    </form>
  )
}
