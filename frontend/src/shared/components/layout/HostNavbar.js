import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/core/auth/useAuth';
import { Avatar } from '../ui/Avatar';
export const HostNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };
    return (_jsx("header", { className: "sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm", children: _jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between px-4 py-3", children: [_jsxs(Link, { to: "/host", className: "flex items-center gap-2", children: [_jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600", children: _jsx("span", { className: "text-sm font-bold text-white", children: "S" }) }), _jsx("span", { className: "text-lg font-bold text-gray-900", children: "Smart" }), _jsx("span", { className: "rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700", children: "Anfitri\u00F3n" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100", children: [_jsx(Home, { className: "h-4 w-4" }), "Ver como hu\u00E9sped"] }), user && (_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setDropdownOpen(v => !v), className: "flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 hover:bg-gray-50", children: [_jsx(Avatar, { src: user.avatarUrl, alt: user.firstName, size: "sm" }), _jsx("span", { className: "hidden text-sm font-medium text-gray-700 md:block", children: user.firstName }), _jsx(ChevronDown, { className: "h-4 w-4 text-gray-400" })] }), dropdownOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-10", onClick: () => setDropdownOpen(false) }), _jsxs("div", { className: "absolute right-0 top-12 z-20 w-48 rounded-xl border border-gray-100 bg-white py-1 shadow-lg", children: [_jsx(Link, { to: "/account/profile", onClick: () => setDropdownOpen(false), className: "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50", children: "Mi perfil" }), _jsx("hr", { className: "my-1 border-gray-100" }), _jsxs("button", { onClick: handleLogout, className: "flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50", children: [_jsx(LogOut, { className: "h-4 w-4" }), " Cerrar sesi\u00F3n"] })] })] }))] }))] })] }) }));
};
