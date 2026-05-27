import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAuth } from '@/core/auth/useAuth';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
export const PersonalInfoForm = () => {
    const { user } = useAuth();
    const [email] = useState(user?.email ?? '');
    const [phone, setPhone] = useState(user?.phone ?? '');
    const [saved, setSaved] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [saved && (_jsx("div", { className: "rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700", children: "Informaci\u00F3n actualizada correctamente" })), _jsx(Input, { id: "email", label: "Correo electr\u00F3nico", type: "email", value: email, readOnly: true, className: "bg-gray-50 cursor-not-allowed" }), _jsx("p", { className: "text-xs text-gray-400", children: "El correo electr\u00F3nico no puede ser modificado." }), _jsx(Input, { id: "phone", label: "Tel\u00E9fono", type: "tel", value: phone, onChange: e => setPhone(e.target.value), placeholder: "+51 987 654 321" }), _jsx(Button, { type: "submit", children: "Guardar" })] }));
};
