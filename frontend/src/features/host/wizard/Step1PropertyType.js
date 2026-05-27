import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StepHeader } from '@/shared/components/ui/StepHeader';
import { WizardNav } from './WizardNav';
import { PROPERTY_TYPES } from '@/shared/utils/constants';
import { cn } from '@/shared/utils/cn';
export const Step1PropertyType = ({ draft, update, onNext, onPrev }) => (_jsxs("div", { children: [_jsx(StepHeader, { current: 1, total: 9, title: "\u00BFQu\u00E9 tipo de propiedad es?", subtitle: "Selecciona el tipo que mejor describe tu espacio." }), _jsx("div", { className: "grid grid-cols-2 gap-3 sm:grid-cols-3", children: PROPERTY_TYPES.map(type => (_jsxs("button", { onClick: () => update({ type: type.id }), className: cn('rounded-2xl border-2 p-4 text-center transition-all', draft.type === type.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'), children: [_jsx("div", { className: "mb-2 text-2xl", children: "\uD83C\uDFE0" }), _jsx("p", { className: "text-sm font-medium text-gray-900", children: type.label })] }, type.id))) }), _jsx(WizardNav, { onPrev: onPrev, onNext: onNext, isFirst: true, canNext: !!draft.type })] }));
