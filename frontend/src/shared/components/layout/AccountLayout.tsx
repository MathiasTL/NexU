import { Outlet } from 'react-router-dom'
import { AccountSidebar } from './AccountSidebar'

export const AccountLayout = () => (
  <div className="mx-auto max-w-7xl px-4 py-8">
    <h1 className="mb-6 text-2xl font-bold text-gray-900">Mi cuenta</h1>
    <div className="flex gap-8">
      <AccountSidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  </div>
)
