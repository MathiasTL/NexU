import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Home, MapPin, Users, DollarSign, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/utils/cn';
import { DEFAULT_ADVANCED_FILTERS, } from '../types/property.types';
// ── Internal sub-components ───────────────────────────────────────────────────
const Counter = ({ value, onChange, min = 0, max = 10, }) => {
    const current = value ?? 0;
    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => onChange(current <= min ? null : current - 1), className: "flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-40", disabled: current <= min, children: "\u2212" }), _jsx("span", { className: "w-6 text-center text-sm font-semibold text-gray-900", children: value === null ? 'Cualq.' : current }), _jsx("button", { type: "button", onClick: () => onChange(Math.min(current + 1, max)), className: "flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-40", disabled: current >= max, children: "+" })] }));
};
const ToggleGroup = ({ options, value, onChange, }) => (_jsx("div", { className: "flex flex-wrap gap-2", children: options.map(opt => (_jsx("button", { type: "button", onClick: () => onChange(opt.value === value ? '' : opt.value), className: cn('rounded-full border px-3 py-1 text-xs font-medium transition-all', value === opt.value
            ? 'border-blue-600 bg-blue-600 text-white'
            : 'border-gray-200 bg-white text-gray-600 hover:border-blue-400'), children: opt.label }, opt.value))) }));
const SectionTitle = ({ icon: Icon, title, }) => (_jsxs("div", { className: "mb-3 flex items-center gap-2 border-b border-gray-100 pb-2", children: [_jsx(Icon, { className: "h-4 w-4 text-blue-600" }), _jsx("h3", { className: "text-sm font-semibold text-gray-900", children: title })] }));
const PROPERTY_TYPES = [
    { value: '', label: 'Cualquiera' },
    { value: 'apartment', label: 'Apartamento' },
    { value: 'house', label: 'Casa' },
    { value: 'studio', label: 'Estudio' },
    { value: 'room', label: 'Habitación' },
];
const SERVICES = [
    { id: 'electricity', label: 'Luz' },
    { id: 'water', label: 'Agua' },
    { id: 'internet', label: 'Internet' },
    { id: 'gas', label: 'Gas' },
];
// ── Count active filters ───────────────────────────────────────────────────────
export const countActiveFilters = (f) => {
    let n = 0;
    if (f.propertyType)
        n++;
    if (f.bedrooms !== null)
        n++;
    if (f.bathrooms !== null)
        n++;
    if (f.university)
        n++;
    if (f.travelMinutes !== null)
        n++;
    if (f.sleepSchedule)
        n++;
    if (f.noiseLevel)
        n++;
    if (f.petsAllowed !== null)
        n++;
    if (f.cleaningLevel)
        n++;
    if (f.studyHabits)
        n++;
    if (f.roommateCount !== null)
        n++;
    if (f.maxPrice !== null)
        n++;
    n += f.servicesIncluded.length;
    return n;
};
// ── Main component ─────────────────────────────────────────────────────────────
export const AdvancedFilters = ({ open, onClose, value, onApply }) => {
    const [draft, setDraft] = useState(value);
    const set = (key, val) => setDraft(prev => ({ ...prev, [key]: val }));
    const toggleService = (id) => {
        setDraft(prev => ({
            ...prev,
            servicesIncluded: prev.servicesIncluded.includes(id)
                ? prev.servicesIncluded.filter(s => s !== id)
                : [...prev.servicesIncluded, id],
        }));
    };
    const handleReset = () => setDraft(DEFAULT_ADVANCED_FILTERS);
    const handleApply = () => {
        onApply(draft);
        onClose();
    };
    if (!open)
        return null;
    const activeCount = countActiveFilters(draft);
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/40 backdrop-blur-sm", onClick: onClose }), _jsxs("div", { className: "relative flex w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-gray-100 px-5 py-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(SlidersHorizontal, { className: "h-5 w-5 text-blue-600" }), _jsx("h2", { className: "text-base font-bold text-gray-900", children: "Filtros Avanzados" })] }), _jsx("button", { onClick: onClose, className: "rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsx("div", { className: "max-h-[70vh] overflow-y-auto p-5", children: _jsxs("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx(SectionTitle, { icon: Home, title: "Del inmueble" }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs font-medium text-gray-600", children: "Tipo de vivienda" }), _jsx("select", { value: draft.propertyType, onChange: e => set('propertyType', e.target.value), className: "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20", children: PROPERTY_TYPES.map(t => (_jsx("option", { value: t.value, children: t.label }, t.value))) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "text-xs font-medium text-gray-600", children: "Dormitorios" }), _jsx(Counter, { value: draft.bedrooms, onChange: v => set('bedrooms', v), max: 6 })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "text-xs font-medium text-gray-600", children: "Ba\u00F1os" }), _jsx(Counter, { value: draft.bathrooms, onChange: v => set('bathrooms', v), max: 4 })] })] })] }), _jsxs("div", { children: [_jsx(SectionTitle, { icon: MapPin, title: "Ubicaci\u00F3n" }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs font-medium text-gray-600", children: "Universidad cercana" }), _jsx("input", { type: "text", value: draft.university, onChange: e => set('university', e.target.value), placeholder: "ej. UNMSM, PUCP, UPC...", className: "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" })] }), _jsxs("div", { children: [_jsxs("div", { className: "mb-1.5 flex items-center justify-between", children: [_jsx("label", { className: "text-xs font-medium text-gray-600", children: "Tiempo de viaje (m\u00E1x.)" }), _jsx("span", { className: "text-xs font-semibold text-blue-600", children: draft.travelMinutes !== null ? `${draft.travelMinutes} min` : 'Cualquiera' })] }), _jsx("input", { type: "range", min: 5, max: 60, step: 5, value: draft.travelMinutes ?? 60, onChange: e => set('travelMinutes', Number(e.target.value)), className: "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-600" }), _jsxs("div", { className: "mt-1 flex justify-between text-[10px] text-gray-400", children: [_jsx("span", { children: "5 min" }), _jsx("span", { children: "60 min" })] })] })] })] }), _jsxs("div", { children: [_jsx(SectionTitle, { icon: Users, title: "Convivencia" }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("label", { className: "text-xs font-medium text-gray-600", children: "N.\u00B0 de roommates" }), _jsx(Counter, { value: draft.roommateCount, onChange: v => set('roommateCount', v), max: 8 })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs font-medium text-gray-600", children: "Horario de sue\u00F1o" }), _jsx(ToggleGroup, { options: [
                                                                { value: 'morning', label: '🌅 Mañanero' },
                                                                { value: 'night', label: '🌙 Nocturno' },
                                                            ], value: draft.sleepSchedule, onChange: v => set('sleepSchedule', v) })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs font-medium text-gray-600", children: "Nivel de ruido" }), _jsx(ToggleGroup, { options: [
                                                                { value: 'low', label: '🔇 Bajo' },
                                                                { value: 'medium', label: '🔉 Medio' },
                                                                { value: 'high', label: '🔊 Alto' },
                                                            ], value: draft.noiseLevel, onChange: v => set('noiseLevel', v) })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs font-medium text-gray-600", children: "Mascotas" }), _jsx("div", { className: "flex gap-2", children: [
                                                                { label: '✓ Sí', val: true },
                                                                { label: '✗ No', val: false },
                                                            ].map(({ label, val }) => (_jsx("button", { type: "button", onClick: () => set('petsAllowed', draft.petsAllowed === val ? null : val), className: cn('rounded-full border px-3 py-1 text-xs font-medium transition-all', draft.petsAllowed === val
                                                                    ? 'border-blue-600 bg-blue-600 text-white'
                                                                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-400'), children: label }, String(val)))) })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs font-medium text-gray-600", children: "Limpieza" }), _jsx(ToggleGroup, { options: [
                                                                { value: 'low', label: 'Flexible' },
                                                                { value: 'medium', label: 'Ordenado' },
                                                                { value: 'high', label: 'Muy limpio' },
                                                            ], value: draft.cleaningLevel, onChange: v => set('cleaningLevel', v) })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-1.5 block text-xs font-medium text-gray-600", children: "H\u00E1bitos de estudio" }), _jsx(ToggleGroup, { options: [
                                                                { value: 'quiet', label: '📚 Silencio' },
                                                                { value: 'mixed', label: '🎧 Mixto' },
                                                                { value: 'social', label: '💬 Social' },
                                                            ], value: draft.studyHabits, onChange: v => set('studyHabits', v) })] })] })] }), _jsxs("div", { children: [_jsx(SectionTitle, { icon: DollarSign, title: "Econ\u00F3micos" }), _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "mb-1.5 flex items-center justify-between", children: [_jsx("label", { className: "text-xs font-medium text-gray-600", children: "Precio m\u00E1ximo (S/)" }), draft.maxPrice !== null && (_jsxs("span", { className: "text-xs font-semibold text-blue-600", children: ["S/ ", draft.maxPrice] }))] }), _jsx("input", { type: "number", min: 50, max: 2000, placeholder: "Sin l\u00EDmite", value: draft.maxPrice ?? '', onChange: e => set('maxPrice', e.target.value ? Number(e.target.value) : null), className: "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" })] }), _jsxs("div", { children: [_jsx("label", { className: "mb-2 block text-xs font-medium text-gray-600", children: "Servicios incluidos" }), _jsx("div", { className: "grid grid-cols-2 gap-2", children: SERVICES.map(svc => (_jsxs("label", { className: "flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 transition-colors hover:border-blue-300", children: [_jsx("input", { type: "checkbox", checked: draft.servicesIncluded.includes(svc.id), onChange: () => toggleService(svc.id), className: "h-4 w-4 rounded border-gray-300 accent-blue-600" }), _jsx("span", { className: "text-xs font-medium text-gray-700", children: svc.label })] }, svc.id))) })] })] })] })] }) }), _jsxs("div", { className: "flex items-center justify-between border-t border-gray-100 px-5 py-4", children: [_jsxs("button", { type: "button", onClick: handleReset, className: "flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500", children: [_jsx(RotateCcw, { className: "h-4 w-4" }), "Limpiar todo"] }), _jsx(Button, { onClick: handleApply, size: "md", children: activeCount > 0
                                    ? `Aplicar filtros (${activeCount})`
                                    : 'Aplicar filtros' })] })] })] }));
};
