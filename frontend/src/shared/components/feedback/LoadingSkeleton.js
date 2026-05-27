import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/shared/utils/cn';
export const Skeleton = ({ className }) => (_jsx("div", { className: cn('animate-pulse rounded-lg bg-gray-200', className) }));
export const PropertyCardSkeleton = () => (_jsxs("div", { className: "overflow-hidden rounded-2xl border border-gray-100", children: [_jsx(Skeleton, { className: "h-48 w-full rounded-none" }), _jsxs("div", { className: "space-y-2 p-4", children: [_jsx(Skeleton, { className: "h-4 w-3/4" }), _jsx(Skeleton, { className: "h-3 w-1/2" }), _jsx(Skeleton, { className: "h-4 w-1/3" })] })] }));
export const LoadingSkeleton = ({ count = 6 }) => (_jsx("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3", children: Array.from({ length: count }).map((_, i) => _jsx(PropertyCardSkeleton, {}, i)) }));
