import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Building2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/core/auth/useAuth';
import { authService } from '../services/auth.service';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { PasswordInput } from '@/shared/components/ui/PasswordInput';
import { GoogleButton } from '@/shared/components/ui/GoogleButton';
import { ErrorMessage } from '@/shared/components/feedback/ErrorMessage';
import { cn } from '@/shared/utils/cn';
export const RegisterForm = ({ role, onChangeRole }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!acceptedTerms) {
            setError('Debes aceptar los términos y condiciones para continuar');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const parts = fullName.trim().split(' ');
            const firstName = parts[0] ?? fullName;
            const lastName = parts.slice(1).join(' ') || firstName;
            await authService.register({ firstName, lastName, email, password, role });
            await login(email, password);
            navigate(role === 'host' ? '/host/dashboard' : '/', { replace: true });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
        }
        finally {
            setLoading(false);
        }
    };
    const RoleIcon = role === 'tenant' ? GraduationCap : Building2;
    const roleLabel = role === 'tenant' ? 'Estudiante' : 'Propietario';
    return (_jsxs("div", { className: "flex flex-col gap-5", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', role === 'tenant'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'), children: [_jsx(RoleIcon, { className: "h-3.5 w-3.5" }), roleLabel] }), _jsxs("button", { type: "button", onClick: onChangeRole, className: "flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-blue-600", children: [_jsx(ArrowLeft, { className: "h-3 w-3" }), "Cambiar rol"] })] }), _jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Crea tu cuenta" }), error && _jsx(ErrorMessage, { message: error }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [_jsx(Input, { id: "fullName", label: "Nombre completo", value: fullName, onChange: e => setFullName(e.target.value), placeholder: "Juan P\u00E9rez", required: true, autoComplete: "name" }), _jsx(Input, { id: "reg-email", label: "Correo electr\u00F3nico", type: "email", value: email, onChange: e => setEmail(e.target.value), placeholder: "juan@universidad.edu.pe", required: true, autoComplete: "email" }), _jsx(PasswordInput, { id: "reg-password", label: "Contrase\u00F1a", value: password, onChange: e => setPassword(e.target.value), placeholder: "M\u00EDnimo 6 caracteres", required: true, autoComplete: "new-password", showStrength: true }), _jsxs("label", { className: "flex cursor-pointer items-start gap-2.5", children: [_jsx("input", { type: "checkbox", checked: acceptedTerms, onChange: e => setAcceptedTerms(e.target.checked), className: "mt-0.5 h-4 w-4 rounded border-gray-300 accent-blue-600" }), _jsxs("span", { className: "text-xs leading-relaxed text-gray-600", children: ["Acepto los", ' ', _jsx(Link, { to: "#", className: "font-medium text-blue-600 hover:underline", children: "t\u00E9rminos y condiciones" }), ' ', "y la", ' ', _jsx(Link, { to: "#", className: "font-medium text-blue-600 hover:underline", children: "pol\u00EDtica de privacidad" })] })] }), _jsx(Button, { type: "submit", loading: loading, size: "lg", className: "w-full", children: "Crear cuenta" }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex-1 border-t border-gray-200" }), _jsx("span", { className: "text-xs text-gray-400", children: "o contin\u00FAa con" }), _jsx("div", { className: "flex-1 border-t border-gray-200" })] }), _jsx(GoogleButton, {})] })] }));
};
