import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { GoogleButton } from '@/shared/components/ui/GoogleButton';
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage';
export const LoginForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') ?? '/';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate(redirect, { replace: true });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [error && _jsx(ErrorMessage, { message: error }), _jsx(Input, { id: "email", label: "Correo electr\u00F3nico", type: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "tu@email.com", required: true, autoComplete: "email" }), _jsx(Input, { id: "password", label: "Contrase\u00F1a", type: "password", value: password, onChange: e => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, autoComplete: "current-password" }), _jsx(Button, { type: "submit", loading: loading, size: "lg", className: "w-full", children: "Iniciar sesi\u00F3n" }), _jsxs("p", { className: "text-center text-sm text-gray-500", children: ["\u00BFNo tienes cuenta?", ' ', _jsx(Link, { to: "/register", className: "font-medium text-blue-600 hover:underline", children: "Reg\u00EDstrate gratis" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex-1 border-t border-gray-200" }), _jsx("span", { className: "text-xs text-gray-400", children: "o contin\u00FAa con" }), _jsx("div", { className: "flex-1 border-t border-gray-200" })] }), _jsx(GoogleButton, {}), _jsxs("div", { className: "rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700", children: [_jsx("strong", { children: "Demo:" }), " maria@example.com / 123456 (estudiante) \u00B7 carlos@example.com / 123456 (propietario)"] })] }));
};
