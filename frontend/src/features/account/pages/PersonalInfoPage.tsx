import { PersonalInfoForm } from '../components/PersonalInfoForm'

export const PersonalInfoPage = () => (
  <div>
    <h2 className="mb-6 text-xl font-bold text-gray-900">Información personal</h2>
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <PersonalInfoForm />
    </div>
  </div>
)
