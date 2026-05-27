import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
const getStrength = (password) => {
    if (!password)
        return { score: 0, label: '', color: '', barColor: 'bg-gray-200' };
    let score = 0;
    if (password.length >= 6)
        score++;
    if (password.length >= 10)
        score++;
    if (/[A-Z]/.test(password) || /[0-9]/.test(password))
        score++;
    if (/[^A-Za-z0-9]/.test(password))
        score++;
    if (score <= 1)
        return { score, label: 'Débil', color: 'text-red-500', barColor: 'bg-red-500' };
    if (score === 2)
        return { score, label: 'Media', color: 'text-yellow-600', barColor: 'bg-yellow-400' };
    if (score === 3)
        return { score, label: 'Buena', color: 'text-blue-600', barColor: 'bg-blue-500' };
    return { score, label: 'Fuerte', color: 'text-green-600', barColor: 'bg-green-500' };
};
export const PasswordInput = ({ id, label, value, onChange, placeholder, required, autoComplete, showStrength = false, error, }) => {
    const [visible, setVisible] = useState(false);
    const strength = getStrength(value);
    return (_jsxs("div", { className: "flex flex-col gap-1", children: [label && (_jsx("label", { htmlFor: id, className: "text-sm font-medium text-gray-700", children: label })), _jsxs("div", { className: "relative", children: [_jsx("input", { id: id, type: visible ? 'text' : 'password', value: value, onChange: onChange, placeholder: placeholder, required: required, autoComplete: autoComplete, className: cn('w-full rounded-xl border border-gray-300 px-3 py-2 pr-10 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20', error && 'border-red-400') }), _jsx("button", { type: "button", tabIndex: -1, onClick: () => setVisible(v => !v), className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600", "aria-label": visible ? 'Ocultar contraseña' : 'Mostrar contraseña', children: visible ? _jsx(EyeOff, { className: "h-4 w-4" }) : _jsx(Eye, { className: "h-4 w-4" }) })] }), error && _jsx("span", { className: "text-xs text-red-500", children: error }), showStrength && value.length > 0 && (_jsxs("div", { className: "mt-1 flex items-center gap-2", children: [_jsx("div", { className: "flex flex-1 gap-1", children: [1, 2, 3, 4].map(i => (_jsx("div", { className: cn('h-1 flex-1 rounded-full transition-colors duration-300', i <= strength.score ? strength.barColor : 'bg-gray-200') }, i))) }), _jsx("span", { className: cn('min-w-[44px] text-right text-xs font-medium', strength.color), children: strength.label })] }))] }));
};
