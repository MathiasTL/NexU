import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Building2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/utils/cn';
const ROLES = [
    {
        value: 'tenant',
        icon: GraduationCap,
        title: 'Soy estudiante',
        description: 'Busco habitación, departamento o roommates cerca de mi universidad.',
        accent: 'blue',
    },
    {
        value: 'host',
        icon: Building2,
        title: 'Soy propietario',
        description: 'Quiero publicar mi espacio y encontrar inquilinos confiables.',
        accent: 'emerald',
    },
];
export const RoleSelector = ({ onSelect }) => {
    const [selected, setSelected] = useState(null);
    return (_jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "\u00BFC\u00F3mo usar\u00E1s NexU?" }), _jsx("p", { className: "mt-1.5 text-sm text-gray-500", children: "Elige tu perfil para personalizar tu experiencia" })] }), _jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: ROLES.map(({ value, icon: Icon, title, description }) => {
                    const isSelected = selected === value;
                    return (_jsxs("button", { type: "button", onClick: () => setSelected(value), className: cn('relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all duration-200', isSelected
                            ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-600/10'
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'), children: [isSelected && (_jsx(CheckCircle2, { className: "absolute right-3 top-3 h-5 w-5 text-blue-600" })), _jsx("div", { className: cn('flex h-16 w-16 items-center justify-center rounded-2xl transition-colors duration-200', isSelected ? 'bg-blue-600' : 'bg-gray-100'), children: _jsx(Icon, { className: cn('h-8 w-8', isSelected ? 'text-white' : 'text-gray-500') }) }), _jsxs("div", { children: [_jsx("p", { className: cn('text-base font-semibold', isSelected ? 'text-blue-900' : 'text-gray-900'), children: title }), _jsx("p", { className: "mt-1 text-xs leading-relaxed text-gray-500", children: description })] })] }, value));
                }) }), _jsxs(Button, { size: "lg", className: "w-full", disabled: selected === null, onClick: () => selected !== null && onSelect(selected), children: ["Continuar", _jsx(ArrowRight, { className: "h-4 w-4" })] }), _jsxs("p", { className: "text-center text-sm text-gray-500", children: ["\u00BFYa tienes cuenta?", ' ', _jsx(Link, { to: "/login", className: "font-medium text-blue-600 hover:underline", children: "Inicia sesi\u00F3n" })] })] }));
};
