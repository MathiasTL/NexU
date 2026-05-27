import { ProfileForm } from '../components/ProfileForm'

export const ProfilePage = () => (
  <div>
    <h2 className="mb-6 text-xl font-bold text-gray-900">Mi perfil</h2>
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <ProfileForm />
    </div>
  </div>
)
