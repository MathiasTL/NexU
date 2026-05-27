import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { cn } from '@/shared/utils/cn';
export const PropertyGallery = ({ images, title }) => {
    const [active, setActive] = useState(0);
    return (_jsxs("div", { className: "overflow-hidden rounded-2xl", children: [_jsx("div", { className: "relative h-80 overflow-hidden", children: _jsx("img", { src: images[active], alt: `${title} - imagen ${active + 1}`, className: "h-full w-full object-cover" }) }), images.length > 1 && (_jsx("div", { className: "mt-2 flex gap-2 overflow-x-auto pb-1", children: images.map((img, i) => (_jsx("button", { onClick: () => setActive(i), className: cn('h-16 w-24 shrink-0 overflow-hidden rounded-xl transition-opacity', i === active ? 'ring-2 ring-blue-500 opacity-100' : 'opacity-60 hover:opacity-80'), children: _jsx("img", { src: img, alt: `miniatura ${i + 1}`, className: "h-full w-full object-cover" }) }, i))) }))] }));
};
