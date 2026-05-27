import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/shared/components/ui/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
export const WizardNav = ({ onPrev, onNext, isFirst, canNext = true, nextLabel = 'Siguiente', loading }) => (_jsxs("div", { className: "mt-8 flex justify-between", children: [_jsxs(Button, { variant: "outline", onClick: onPrev, disabled: isFirst, children: [_jsx(ArrowLeft, { className: "h-4 w-4" }), " Atr\u00E1s"] }), _jsxs(Button, { onClick: onNext, disabled: !canNext, loading: loading, children: [nextLabel, " ", _jsx(ArrowRight, { className: "h-4 w-4" })] })] }));
