import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '@/core/auth/useAuth';
import { propertyService } from '@/features/properties/services/property.service';
import { HostPropertyCard } from '../components/HostPropertyCard';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Spinner } from '@/shared/components/ui/Spinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
export const HostPropertiesPage = () => {
    const { user } = useAuth();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    useEffect(() => {
        if (!user)
            return;
        propertyService.getByHostId(user.id).then(data => {
            setProperties(data);
            setLoading(false);
        });
    }, [user]);
    const filtered = properties.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.district.toLowerCase().includes(search.toLowerCase()));
    if (loading)
        return _jsx("div", { className: "flex justify-center py-20", children: _jsx(Spinner, {}) });
    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-6 flex items-center justify-between gap-4", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Mis propiedades" }), _jsx(Link, { to: "/host/new-property", children: _jsxs(Button, { size: "sm", children: [_jsx(Plus, { className: "h-4 w-4" }), " Nueva propiedad"] }) })] }), _jsx("div", { className: "mb-4 flex items-center gap-2", children: _jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" }), _jsx(Input, { value: search, onChange: e => setSearch(e.target.value), placeholder: "Buscar propiedades...", className: "pl-9" })] }) }), filtered.length === 0 ? (_jsx(EmptyState, { title: "No tienes propiedades publicadas", description: "Publica tu primera propiedad y empieza a recibir hu\u00E9spedes.", action: _jsx(Link, { to: "/host/new-property", children: _jsxs(Button, { children: [_jsx(Plus, { className: "h-4 w-4" }), " Publicar propiedad"] }) }) })) : (_jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: filtered.map(p => (_jsx(HostPropertyCard, { property: p }, p.id))) }))] }));
};
