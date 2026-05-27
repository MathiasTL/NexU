import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
    useEffect(() => {
        if (open)
            document.body.style.overflow = 'hidden';
        else
            document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);
    if (!open)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/50", onClick: onClose }), _jsxs("div", { className: cn('relative w-full rounded-2xl bg-white shadow-xl', sizes[size]), children: [title && (_jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 p-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: title }), _jsx("button", { onClick: onClose, className: "rounded-lg p-1 hover:bg-gray-100", children: _jsx(X, { className: "h-5 w-5" }) })] })), _jsx("div", { className: "max-h-[80vh] overflow-y-auto p-4", children: children })] })] }));
};
