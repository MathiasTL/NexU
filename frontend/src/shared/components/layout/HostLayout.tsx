import { Outlet } from 'react-router-dom'
import { HostNavbar } from './HostNavbar'
import { HostSidebar } from './HostSidebar'

export const HostLayout = () => (
  <div className="flex min-h-screen flex-col">
    <HostNavbar />
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8">
      <HostSidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  </div>
)
