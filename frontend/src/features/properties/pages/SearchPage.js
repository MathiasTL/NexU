import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Map, List, SlidersHorizontal, DollarSign } from 'lucide-react';
import { propertyService } from '../services/property.service';
import { PropertyCard } from '../components/PropertyCard';
import { PropertySearchMap } from '../components/PropertySearchMap';
import { AdvancedFilters, countActiveFilters } from '../components/AdvancedFilters';
import { LoadingSkeleton } from '@/shared/components/feedback/LoadingSkeleton';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/utils/cn';
import { DEFAULT_ADVANCED_FILTERS, } from '../types/property.types';
// ── Quick-filter chip config ──────────────────────────────────────────────────
const QUICK_FILTERS = [
    { value: 'all', label: 'Todos' },
    { value: 'individual', label: 'Individual' },
    { value: 'shared', label: 'Compartido' },
    { value: 'roommates', label: 'Roommates' },
    { value: 'petFriendly', label: '🐾 Pet Friendly' },
];
// ── Component ─────────────────────────────────────────────────────────────────
export const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMap, setShowMap] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [locationQuery, setLocationQuery] = useState(searchParams.get('q') ?? '');
    const [budget, setBudget] = useState('');
    const [quickFilter, setQuickFilter] = useState('all');
    const [advancedFilters, setAdvancedFilters] = useState(DEFAULT_ADVANCED_FILTERS);
    const debouncedQuery = useDebounce(locationQuery, 400);
    useEffect(() => {
        setLoading(true);
        const maxPriceVal = budget
            ? Number(budget)
            : advancedFilters.maxPrice !== null
                ? advancedFilters.maxPrice
                : undefined;
        const amenitiesFromAdvanced = [
            ...(advancedFilters.petsAllowed === true ? ['PETS_ALLOWED'] : []),
            ...(advancedFilters.noiseLevel === 'low' ? ['QUIET_HOURS'] : []),
        ];
        propertyService
            .search({
            query: debouncedQuery || undefined,
            maxPrice: maxPriceVal,
            bedrooms: advancedFilters.bedrooms !== null ? advancedFilters.bedrooms : undefined,
            bathrooms: advancedFilters.bathrooms !== null ? advancedFilters.bathrooms : undefined,
            amenities: amenitiesFromAdvanced.length ? amenitiesFromAdvanced : undefined,
            quickFilter: quickFilter !== 'all' ? quickFilter : null,
        })
            .then(data => {
            setProperties(data);
            setLoading(false);
        });
    }, [debouncedQuery, budget, quickFilter, advancedFilters]);
    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams(locationQuery ? { q: locationQuery } : {});
    };
    const advancedCount = countActiveFilters(advancedFilters);
    return (_jsxs("div", { className: "flex h-[calc(100vh-65px)] overflow-hidden", children: [_jsxs("div", { className: "flex w-full flex-col overflow-y-auto md:w-[55%] lg:w-[50%]", children: [_jsxs("div", { className: "sticky top-0 z-10 border-b border-gray-100 bg-white px-4 pb-3 pt-4 shadow-sm", children: [_jsxs("form", { onSubmit: handleSearch, className: "flex overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm", children: [_jsxs("div", { className: "flex flex-1 items-center gap-2 px-3 py-2", children: [_jsx(Search, { className: "h-4 w-4 flex-shrink-0 text-gray-400" }), _jsx("input", { value: locationQuery, onChange: e => setLocationQuery(e.target.value), placeholder: "Universidad o Distrito", className: "w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400" })] }), _jsx("div", { className: "my-2 w-px bg-gray-200" }), _jsxs("div", { className: "flex w-32 items-center gap-1.5 px-3 py-2", children: [_jsx(DollarSign, { className: "h-4 w-4 flex-shrink-0 text-gray-400" }), _jsx("input", { type: "number", value: budget, onChange: e => setBudget(e.target.value), placeholder: "Presupuesto", min: 0, className: "w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400" })] }), _jsx("button", { type: "submit", className: "m-1.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700", "aria-label": "Buscar", children: _jsx(Search, { className: "h-4 w-4" }) })] }), _jsxs("div", { className: "mt-3 flex items-center gap-2 overflow-x-auto pb-1", children: [QUICK_FILTERS.map(({ value, label }) => (_jsx("button", { type: "button", onClick: () => setQuickFilter(value), className: cn('flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all', quickFilter === value
                                            ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600'), children: label }, value))), _jsxs("button", { type: "button", onClick: () => setShowAdvanced(true), className: cn('ml-auto flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all', advancedCount > 0
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 bg-white text-gray-600 hover:border-blue-400'), children: [_jsx(SlidersHorizontal, { className: "h-3.5 w-3.5" }), "Filtros", advancedCount > 0 && (_jsx("span", { className: "flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white", children: advancedCount }))] }), _jsx("button", { type: "button", onClick: () => setShowMap(v => !v), className: "flex-shrink-0 rounded-full border border-gray-200 bg-white p-1.5 text-gray-600 hover:border-blue-400 md:hidden", "aria-label": showMap ? 'Ocultar mapa' : 'Mostrar mapa', children: showMap ? _jsx(List, { className: "h-3.5 w-3.5" }) : _jsx(Map, { className: "h-3.5 w-3.5" }) })] }), _jsx("p", { className: "mt-2 text-xs text-gray-400", children: loading ? 'Buscando...' : `${properties.length} propiedades encontradas` })] }), _jsx("div", { className: "p-4", children: loading ? (_jsx(LoadingSkeleton, { count: 4 })) : properties.length === 0 ? (_jsx(EmptyState, { title: "Sin resultados", description: "Prueba cambiando los filtros o t\u00E9rminos de b\u00FAsqueda." })) : (_jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: properties.map(p => (_jsx(PropertyCard, { property: p }, p.id))) })) })] }), _jsx("div", { className: cn('flex-1 border-l border-gray-100', showMap ? 'hidden md:block' : 'hidden'), children: _jsx(PropertySearchMap, { properties: properties }) }), _jsx(AdvancedFilters, { open: showAdvanced, onClose: () => setShowAdvanced(false), value: advancedFilters, onApply: setAdvancedFilters })] }));
};
