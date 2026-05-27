import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as Icons from 'lucide-react';
import { AMENITY_CATEGORIES } from '@/mock/amenities.mock';
const DynamicIcon = ({ name }) => {
    const IconComponent = Icons[name];
    if (!IconComponent)
        return _jsx(Icons.Circle, { className: "h-4 w-4" });
    return _jsx(IconComponent, { className: "h-4 w-4" });
};
export const PropertyAmenities = ({ amenities }) => {
    const activeAmenities = AMENITY_CATEGORIES
        .flatMap(cat => cat.amenities.map(a => ({ ...a, category: cat.title })))
        .filter(a => amenities.includes(a.id));
    if (!activeAmenities.length)
        return null;
    return (_jsxs("div", { children: [_jsx("h2", { className: "mb-4 text-xl font-semibold text-gray-900", children: "Lo que ofrece este lugar" }), _jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3", children: activeAmenities.map(amenity => (_jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5", children: [_jsx("span", { className: "text-blue-500", children: _jsx(DynamicIcon, { name: amenity.icon }) }), _jsx("span", { className: "text-sm text-gray-700", children: amenity.name })] }, amenity.id))) })] }));
};
