import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, DollarSign, GraduationCap, Building2 } from 'lucide-react';
import { propertyService } from '../services/property.service';
import { PropertyCard } from '../components/PropertyCard';
import { LoadingSkeleton } from '@/shared/components/feedback/LoadingSkeleton';
import { useAuth } from '@/core/auth/useAuth';
import { cn } from '@/shared/utils/cn';
export const PropertiesHomePage = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationQuery, setLocationQuery] = useState('');
    const [budget, setBudget] = useState('');
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    useEffect(() => {
        propertyService.getAll().then(data => {
            setProperties(data);
            setLoading(false);
        });
    }, []);
    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (locationQuery)
            params.set('q', locationQuery);
        if (budget)
            params.set('budget', budget);
        navigate(`/search${params.toString() ? `?${params.toString()}` : ''}`);
    };
    const handlePublish = () => {
        if (isAuthenticated && (user?.role === 'host' || user?.role === 'both')) {
            navigate('/host/properties/create');
        }
        else {
            navigate('/register');
        }
    };
    return (_jsxs("div", { children: [_jsx("section", { className: "bg-blue-700 pb-16 pt-16", children: _jsxs("div", { className: "mx-auto max-w-3xl px-4 text-center", children: [_jsxs("div", { className: "mb-4 inline-flex items-center gap-2 rounded-full bg-blue-600/60 px-4 py-1.5 text-xs font-medium text-blue-100 ring-1 ring-blue-400/30", children: [_jsx(GraduationCap, { className: "h-3.5 w-3.5" }), "Plataforma universitaria de alojamiento"] }), _jsxs("h1", { className: "mb-4 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl", children: ["Encuentra tu espacio", ' ', _jsx("span", { className: "text-blue-200", children: "universitario ideal" })] }), _jsx("p", { className: "mb-8 text-base leading-relaxed text-blue-100 md:text-lg", children: "Conectamos estudiantes con alojamientos verificados y roommates compatibles." }), _jsxs("div", { className: "mb-10 flex flex-wrap items-center justify-center gap-3", children: [_jsxs("button", { onClick: () => navigate('/search'), className: "inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg shadow-black/10 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]", children: [_jsx(Search, { className: "h-4 w-4" }), "Busco alojamiento"] }), _jsxs("button", { onClick: handlePublish, className: "inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-transparent px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/70 hover:bg-white/10 active:scale-[0.98]", children: [_jsx(Building2, { className: "h-4 w-4" }), "Quiero publicar mi espacio"] })] }), _jsxs("form", { onSubmit: handleSearch, className: "mx-auto flex max-w-2xl items-center overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/20", children: [_jsxs("div", { className: "flex flex-1 items-center gap-2.5 px-4 py-3.5", children: [_jsx(Search, { className: "h-4 w-4 flex-shrink-0 text-blue-500" }), _jsx("input", { type: "text", value: locationQuery, onChange: e => setLocationQuery(e.target.value), placeholder: "Universidad o Distrito", className: "w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400" })] }), _jsx("div", { className: "h-8 w-px bg-gray-200" }), _jsxs("div", { className: cn('flex items-center gap-2 px-4 py-3.5', 'w-40 flex-shrink-0'), children: [_jsx(DollarSign, { className: "h-4 w-4 flex-shrink-0 text-blue-500" }), _jsx("input", { type: "number", value: budget, onChange: e => setBudget(e.target.value), placeholder: "S/ Presupuesto m\u00E1x.", min: 0, className: "w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400" })] }), _jsx("div", { className: "p-2", children: _jsx("button", { type: "submit", className: "flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 active:scale-95", "aria-label": "Buscar", children: _jsx(Search, { className: "h-4 w-4" }) }) })] }), _jsxs("div", { className: "mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-blue-200", children: [_jsx("span", { children: "\u2713 Anuncios verificados" }), _jsx("span", { children: "\u2713 B\u00FAsqueda por universidad" }), _jsx("span", { children: "\u2713 Match de roommates" })] })] }) }), _jsxs("section", { className: "mx-auto max-w-7xl px-4 py-12", children: [_jsxs("div", { className: "mb-6 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Espacios destacados en Lima" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "Alojamientos verificados cerca de las principales universidades" })] }), _jsx("button", { onClick: () => navigate('/search'), className: "hidden text-sm font-medium text-blue-600 hover:underline sm:block", children: "Ver todos \u2192" })] }), loading ? (_jsx(LoadingSkeleton, { count: 8 })) : (_jsx("div", { className: "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: properties.map(p => (_jsx(PropertyCard, { property: p }, p.id))) }))] })] }));
};
