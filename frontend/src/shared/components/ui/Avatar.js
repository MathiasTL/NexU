import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/shared/utils/cn';
const sizes = { sm: 'h-8 w-8 text-sm', md: 'h-10 w-10 text-base', lg: 'h-14 w-14 text-xl' };
export const Avatar = ({ src, alt = '', size = 'md', className }) => (src
    ? _jsx("img", { src: src, alt: alt, className: cn('rounded-full object-cover', sizes[size], className) })
    : _jsx("div", { className: cn('flex items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700', sizes[size], className), children: alt.charAt(0).toUpperCase() }));
