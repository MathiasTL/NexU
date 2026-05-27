import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '@/core/auth/useAuth';
import { accountService } from '../services/account.service';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Avatar } from '@/shared/components/ui/Avatar';
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage';
export const ProfileForm = () => {
    const { user, login } = useAuth();
    const [form, setForm] = useState({
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        phone: user?.phone ?? '',
        bio: user?.bio ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user)
            return;
        setSaving(true);
        setError('');
        setSuccess(false);
        try {
            await accountService.updateProfile(user.id, form);
            await login(user.email, '');
            setSuccess(true);
        }
        catch {
            setError('No se pudo guardar el perfil');
        }
        finally {
            setSaving(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Avatar, { src: user?.avatarUrl, alt: user?.firstName, size: "lg" }), _jsxs("div", { children: [_jsxs("p", { className: "font-semibold text-gray-900", children: [user?.firstName, " ", user?.lastName] }), _jsx("p", { className: "text-sm text-gray-500", children: user?.email })] })] }), error && _jsx(ErrorMessage, { message: error }), success && (_jsx("div", { className: "rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700", children: "Perfil actualizado correctamente" })), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Input, { id: "firstName", name: "firstName", label: "Nombre", value: form.firstName, onChange: handleChange, required: true }), _jsx(Input, { id: "lastName", name: "lastName", label: "Apellido", value: form.lastName, onChange: handleChange, required: true })] }), _jsx(Input, { id: "phone", name: "phone", label: "Tel\u00E9fono", type: "tel", value: form.phone, onChange: handleChange, placeholder: "+51 987 654 321" }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { htmlFor: "bio", className: "text-sm font-medium text-gray-700", children: "Sobre m\u00ED" }), _jsx("textarea", { id: "bio", name: "bio", value: form.bio, onChange: handleChange, rows: 3, className: "rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20", placeholder: "Cu\u00E9ntales algo sobre ti a los anfitriones..." })] }), _jsx(Button, { type: "submit", loading: saving, children: "Guardar cambios" })] }));
};
