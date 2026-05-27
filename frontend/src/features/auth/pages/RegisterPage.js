import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { RoleSelector } from '../components/RoleSelector';
import { RegisterForm } from '../components/RegisterForm';
export const RegisterPage = () => {
    const [step, setStep] = useState('role');
    const [role, setRole] = useState('tenant');
    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setStep('form');
    };
    return (_jsx("div", { className: "flex min-h-[calc(100vh-64px)] items-center justify-center p-4 py-10", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx("div", { className: "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600", children: _jsx("span", { className: "text-xl font-bold text-white", children: "N" }) }), _jsx("p", { className: "text-sm text-gray-500", children: "\u00DAnete a la comunidad NexU" })] }), _jsx("div", { className: "rounded-2xl border border-gray-100 bg-white p-6 shadow-sm", children: step === 'role' ? (_jsx(RoleSelector, { onSelect: handleRoleSelect })) : (_jsx(RegisterForm, { role: role, onChangeRole: () => setStep('role') })) })] }) }));
};
