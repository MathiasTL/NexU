import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/core/auth/useAuth';
import { authService } from '../services/auth.service';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage';
export const RegisterForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'tenant',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.register(form);
            await login(form.email, form.password);
            navigate('/', { replace: true });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrarse');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [error && _jsx(ErrorMessage, { message: error }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsx(Input, { id: "firstName", name: "firstName", label: "Nombre", value: form.firstName, onChange: handleChange, placeholder: "Mar\u00EDa", required: true }), _jsx(Input, { id: "lastName", name: "lastName", label: "Apellido", value: form.lastName, onChange: handleChange, placeholder: "Gonz\u00E1lez", required: true })] }), _jsx(Input, { id: "email", name: "email", label: "Correo electr\u00F3nico", type: "email", value: form.email, onChange: handleChange, placeholder: "tu@email.com", required: true, autoComplete: "email" }), _jsx(Input, { id: "password", name: "password", label: "Contrase\u00F1a", type: "password", value: form.password, onChange: handleChange, placeholder: "M\u00EDnimo 6 caracteres", required: true, minLength: 6 }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("label", { htmlFor: "role", className: "text-sm font-medium text-gray-700", children: "\u00BFC\u00F3mo quieres usar Smart?" }), _jsxs("select", { id: "role", name: "role", value: form.role, onChange: handleChange, className: "rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20", children: [_jsx("option", { value: "tenant", children: "Buscar propiedades (Hu\u00E9sped)" }), _jsx("option", { value: "host", children: "Publicar propiedades (Anfitri\u00F3n)" })] })] }), _jsx(Button, { type: "submit", loading: loading, size: "lg", className: "w-full", children: "Crear cuenta" }), _jsxs("p", { className: "text-center text-sm text-gray-500", children: ["\u00BFYa tienes cuenta?", ' ', _jsx(Link, { to: "/login", className: "font-medium text-blue-600 hover:underline", children: "Inicia sesi\u00F3n" })] })] }));
};
