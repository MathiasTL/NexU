import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { AccountSidebar } from './AccountSidebar';
export const AccountLayout = () => (_jsxs("div", { className: "mx-auto max-w-7xl px-4 py-8", children: [_jsx("h1", { className: "mb-6 text-2xl font-bold text-gray-900", children: "Mi cuenta" }), _jsxs("div", { className: "flex gap-8", children: [_jsx(AccountSidebar, {}), _jsx("div", { className: "min-w-0 flex-1", children: _jsx(Outlet, {}) })] })] }));
