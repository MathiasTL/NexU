import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StepHeader } from '@/shared/components/ui/StepHeader';
import { WizardNav } from './WizardNav';
import { AMENITY_CATEGORIES } from '@/mock/amenities.mock';
import { cn } from '@/shared/utils/cn';
export const Step4Amenities = ({ draft, update, onNext, onPrev }) => {
    const toggle = (id) => {
        const current = draft.amenities;
        update({
            amenities: current.includes(id) ? current.filter(a => a !== id) : [...current, id]
        });
    };
    return (_jsxs("div", { children: [_jsx(StepHeader, { current: 4, total: 9, title: "\u00BFQu\u00E9 servicios ofreces?", subtitle: "Selecciona todos los que apliquen a tu propiedad." }), _jsx("div", { className: "flex flex-col gap-6", children: AMENITY_CATEGORIES.map(cat => (_jsxs("div", { children: [_jsx("h3", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400", children: cat.title }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: cat.amenities.map(amenity => (_jsx("button", { onClick: () => toggle(amenity.id), className: cn('rounded-xl border px-3 py-2 text-left text-sm transition-all', draft.amenities.includes(amenity.id)
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 text-gray-700 hover:border-gray-300'), children: amenity.name }, amenity.id))) })] }, cat.title))) }), _jsx(WizardNav, { onPrev: onPrev, onNext: onNext })] }));
};
