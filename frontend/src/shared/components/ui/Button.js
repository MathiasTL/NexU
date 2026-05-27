import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/shared/utils/cn';
const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
};
const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};
export const Button = ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }) => (_jsxs("button", { className: cn('inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:cursor-not-allowed', variants[variant], sizes[size], className), disabled: disabled || loading, ...props, children: [loading && _jsx("span", { className: "h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" }), children] }));
