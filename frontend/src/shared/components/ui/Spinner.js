import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/shared/utils/cn';
export const Spinner = ({ className }) => (_jsx("div", { className: cn('h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600', className) }));
