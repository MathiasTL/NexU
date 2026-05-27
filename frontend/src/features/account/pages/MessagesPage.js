import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useAuth } from '@/core/auth/useAuth';
import { accountService } from '../services/account.service';
import { USERS_MOCK } from '@/mock/users.mock';
import { PROPERTIES_MOCK } from '@/mock/properties.mock';
import { Spinner } from '@/shared/components/ui/Spinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
import { Avatar } from '@/shared/components/ui/Avatar';
import { formatDateTime } from '@/shared/utils/formatters';
import { cn } from '@/shared/utils/cn';
export const MessagesPage = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    useEffect(() => {
        if (!user)
            return;
        accountService.getConversations(user.id).then(data => {
            setConversations(data.sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)));
            setLoading(false);
        });
    }, [user]);
    const getOtherParticipant = (conv) => {
        const otherId = conv.participants.find(p => p !== user?.id) ?? 0;
        return USERS_MOCK.find(u => u.id === otherId);
    };
    const getProperty = (conv) => PROPERTIES_MOCK.find(p => p.id === conv.propertyId);
    const handleSend = async (e) => {
        e.preventDefault();
        if (!selected || !user || !newMessage.trim())
            return;
        setSending(true);
        const msg = await accountService.sendMessage(selected.id, user.id, newMessage.trim());
        if (msg) {
            setConversations(prev => prev.map(c => c.id === selected.id ? {
                ...c,
                messages: [...c.messages, msg],
                lastMessageAt: msg.createdAt,
            } : c));
            setSelected(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : null);
        }
        setNewMessage('');
        setSending(false);
    };
    if (loading)
        return _jsx("div", { className: "flex justify-center py-20", children: _jsx(Spinner, {}) });
    return (_jsxs("div", { children: [_jsx("h2", { className: "mb-6 text-xl font-bold text-gray-900", children: "Mensajes" }), conversations.length === 0 ? (_jsx(EmptyState, { icon: _jsx(MessageSquare, { className: "h-12 w-12" }), title: "Sin mensajes", description: "Tus conversaciones con anfitriones y hu\u00E9spedes aparecer\u00E1n aqu\u00ED." })) : (_jsxs("div", { className: "flex gap-4 overflow-hidden rounded-2xl border border-gray-100", style: { height: '500px' }, children: [_jsx("div", { className: "w-64 shrink-0 overflow-y-auto border-r border-gray-100", children: conversations.map(conv => {
                            const other = getOtherParticipant(conv);
                            const property = getProperty(conv);
                            const lastMsg = conv.messages[conv.messages.length - 1];
                            return (_jsxs("button", { onClick: () => setSelected(conv), className: cn('flex w-full items-start gap-3 border-b border-gray-100 px-3 py-3 text-left hover:bg-gray-50', selected?.id === conv.id && 'bg-blue-50'), children: [_jsx(Avatar, { src: other?.avatarUrl, alt: other?.firstName, size: "sm" }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: other?.firstName }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: property?.title ?? '' }), lastMsg && _jsx("p", { className: "mt-0.5 text-xs text-gray-400 truncate", children: lastMsg.text })] })] }, conv.id));
                        }) }), selected ? (_jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [_jsxs("div", { className: "border-b border-gray-100 px-4 py-3", children: [_jsx("p", { className: "font-medium text-gray-900", children: getOtherParticipant(selected)?.firstName }), _jsx("p", { className: "text-xs text-gray-500", children: getProperty(selected)?.title })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-4 flex flex-col gap-2", children: selected.messages.map(msg => (_jsx("div", { className: cn('flex', msg.senderId === user?.id ? 'justify-end' : 'justify-start'), children: _jsxs("div", { className: cn('max-w-[70%] rounded-2xl px-4 py-2 text-sm', msg.senderId === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'), children: [_jsx("p", { children: msg.text }), _jsx("p", { className: cn('mt-1 text-xs', msg.senderId === user?.id ? 'text-blue-200' : 'text-gray-400'), children: formatDateTime(msg.createdAt) })] }) }, msg.id))) }), _jsxs("form", { onSubmit: handleSend, className: "flex gap-2 border-t border-gray-100 p-3", children: [_jsx("input", { value: newMessage, onChange: e => setNewMessage(e.target.value), placeholder: "Escribe un mensaje...", className: "flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" }), _jsx("button", { type: "submit", disabled: sending || !newMessage.trim(), className: "flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50", children: _jsx(Send, { className: "h-4 w-4" }) })] })] })) : (_jsx("div", { className: "flex flex-1 items-center justify-center text-sm text-gray-400", children: "Selecciona una conversaci\u00F3n" }))] }))] }));
};
