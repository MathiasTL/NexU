import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { USERS_MOCK } from '@/mock/users.mock';
import { Avatar } from '@/shared/components/ui/Avatar';
import { formatDate } from '@/shared/utils/formatters';
export const PropertyHostInfo = ({ hostId }) => {
    const [host, setHost] = useState(null);
    useEffect(() => {
        const found = USERS_MOCK.find(u => u.id === hostId) ?? null;
        setHost(found);
    }, [hostId]);
    if (!host)
        return null;
    return (_jsxs("div", { className: "rounded-2xl border border-gray-100 bg-gray-50 p-4", children: [_jsx("h3", { className: "mb-3 font-semibold text-gray-900", children: "Sobre el anfitri\u00F3n" }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(Avatar, { src: host.avatarUrl, alt: host.firstName, size: "lg" }), _jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-gray-900", children: [host.firstName, " ", host.lastName] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Anfitri\u00F3n desde ", formatDate(host.createdAt)] }), host.bio && _jsx("p", { className: "mt-2 text-sm text-gray-600", children: host.bio })] })] })] }));
};
