import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Map, List } from 'lucide-react';
import { propertyService } from '../services/property.service';
import { PropertyCard } from '../components/PropertyCard';
import { PropertySearchMap } from '../components/PropertySearchMap';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { LoadingSkeleton } from '@/shared/components/feedback/LoadingSkeleton';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { useDebounce } from '@/shared/hooks/useDebounce';
export const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMap, setShowMap] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [query, setQuery] = useState(searchParams.get('q') ?? '');
    const [maxPrice, setMaxPrice] = useState('');
    const [minCapacity, setMinCapacity] = useState('');
    const debouncedQuery = useDebounce(query, 400);
    useEffect(() => {
        setLoading(true);
        propertyService.search({
            query: debouncedQuery || undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            capacity: minCapacity ? Number(minCapacity) : undefined,
        }).then(data => {
            setProperties(data);
            setLoading(false);
        });
    }, [debouncedQuery, maxPrice, minCapacity]);
    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams(query ? { q: query } : {});
    };
    return (_jsxs("div", { className: "flex h-[calc(100vh-65px)] overflow-hidden", children: [_jsxs("div", { className: "flex w-full flex-col overflow-y-auto md:w-[55%] lg:w-[50%]", children: [_jsxs("div", { className: "sticky top-0 z-10 border-b border-gray-100 bg-white p-4", children: [_jsxs("form", { onSubmit: handleSearch, className: "flex gap-2", children: [_jsx(Input, { value: query, onChange: e => setQuery(e.target.value), placeholder: "Buscar por distrito o nombre...", className: "flex-1" }), _jsx(Button, { variant: "outline", type: "button", onClick: () => setShowFilters(v => !v), children: _jsx(SlidersHorizontal, { className: "h-4 w-4" }) }), _jsx("button", { type: "button", onClick: () => setShowMap(v => !v), className: "rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 md:hidden", children: showMap ? _jsx(List, { className: "h-4 w-4" }) : _jsx(Map, { className: "h-4 w-4" }) })] }), showFilters && (_jsxs("div", { className: "mt-3 grid grid-cols-2 gap-3", children: [_jsx(Input, { label: "Precio m\u00E1ximo (S/)", type: "number", value: maxPrice, onChange: e => setMaxPrice(e.target.value), placeholder: "500" }), _jsx(Input, { label: "M\u00EDnimo hu\u00E9spedes", type: "number", value: minCapacity, onChange: e => setMinCapacity(e.target.value), placeholder: "2" })] })), _jsx("p", { className: "mt-2 text-xs text-gray-500", children: loading ? 'Buscando...' : `${properties.length} propiedades encontradas` })] }), _jsx("div", { className: "p-4", children: loading ? (_jsx(LoadingSkeleton, { count: 4 })) : properties.length === 0 ? (_jsx(EmptyState, { title: "Sin resultados", description: "Prueba con otros filtros o t\u00E9rminos de b\u00FAsqueda." })) : (_jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2", children: properties.map(p => (_jsx(PropertyCard, { property: p }, p.id))) })) })] }), _jsx("div", { className: `hidden flex-1 border-l border-gray-100 md:block ${showMap ? '' : 'hidden'}`, children: _jsx(PropertySearchMap, { properties: properties }) })] }));
};
