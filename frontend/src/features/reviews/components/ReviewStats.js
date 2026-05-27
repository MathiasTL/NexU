import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Star } from 'lucide-react';
export const ReviewStats = ({ reviews }) => {
    if (!reviews.length)
        return null;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const distribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        pct: Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100),
    }));
    return (_jsxs("div", { className: "flex gap-8", children: [_jsxs("div", { className: "flex flex-col items-center justify-center", children: [_jsx("span", { className: "text-5xl font-bold text-gray-900", children: avg.toFixed(1) }), _jsx("div", { className: "mt-1 flex", children: [1, 2, 3, 4, 5].map(i => (_jsx(Star, { className: `h-4 w-4 ${i <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}` }, i))) }), _jsxs("span", { className: "mt-1 text-sm text-gray-500", children: [reviews.length, " rese\u00F1as"] })] }), _jsx("div", { className: "flex flex-1 flex-col gap-1.5", children: distribution.map(({ star, pct }) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 text-xs text-gray-500", children: star }), _jsx("div", { className: "h-2 flex-1 overflow-hidden rounded-full bg-gray-100", children: _jsx("div", { className: "h-full rounded-full bg-amber-400 transition-all", style: { width: `${pct}%` } }) }), _jsxs("span", { className: "w-7 text-xs text-gray-400", children: [pct, "%"] })] }, star))) })] }));
};
