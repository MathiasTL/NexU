import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { HostNavbar } from './HostNavbar';
import { HostSidebar } from './HostSidebar';
export const HostLayout = () => (_jsxs("div", { className: "flex min-h-screen flex-col", children: [_jsx(HostNavbar, {}), _jsxs("div", { className: "mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8", children: [_jsx(HostSidebar, {}), _jsx("div", { className: "min-w-0 flex-1", children: _jsx(Outlet, {}) })] })] }));
