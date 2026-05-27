import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { propertyService } from '../services/property.service';
import { PropertyCard } from '../components/PropertyCard';
import { LoadingSkeleton } from '@/shared/components/feedback/LoadingSkeleton';
export const PropertiesHomePage = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        propertyService.getAll().then(data => {
            setProperties(data);
            setLoading(false);
        });
    }, []);
    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    };
    return (_jsxs("div", { children: [_jsx("div", { className: "relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 py-20 text-center", children: _jsxs("div", { className: "relative mx-auto max-w-2xl px-4", children: [_jsx("h1", { className: "mb-3 text-4xl font-bold text-white md:text-5xl", children: "Encuentra tu espacio ideal en Per\u00FA" }), _jsx("p", { className: "mb-8 text-blue-100", children: "Miles de propiedades \u00FAnicas en Lima y todo el pa\u00EDs" }), _jsxs("form", { onSubmit: handleSearch, className: "flex overflow-hidden rounded-2xl bg-white shadow-lg", children: [_jsx("input", { type: "text", value: query, onChange: e => setQuery(e.target.value), placeholder: "\u00BFAd\u00F3nde vas? Busca por distrito...", className: "flex-1 px-5 py-4 text-sm text-gray-900 outline-none" }), _jsxs("button", { type: "submit", className: "flex items-center gap-2 bg-blue-600 px-5 text-white hover:bg-blue-700", children: [_jsx(Search, { className: "h-5 w-5" }), _jsx("span", { className: "hidden sm:block font-medium", children: "Buscar" })] })] })] }) }), _jsxs("div", { className: "mx-auto max-w-7xl px-4 py-12", children: [_jsx("h2", { className: "mb-6 text-2xl font-bold text-gray-900", children: "Propiedades destacadas en Lima" }), loading ? (_jsx(LoadingSkeleton, { count: 8 })) : (_jsx("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: properties.map(p => (_jsx(PropertyCard, { property: p }, p.id))) }))] })] }));
};
