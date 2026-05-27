import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { formatCurrency } from '@/shared/utils/formatters';
import { LIMA_CENTER } from '@/shared/utils/constants';
// Fix default icon issue with Webpack/Vite
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl,
    shadowUrl: iconShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
export const PropertySearchMap = ({ properties }) => {
    useEffect(() => {
        // Ensure map resizes correctly
        window.dispatchEvent(new Event('resize'));
    }, []);
    return (_jsx("div", { className: "h-full min-h-[500px] overflow-hidden rounded-2xl", children: _jsxs(MapContainer, { center: [LIMA_CENTER.lat, LIMA_CENTER.lng], zoom: LIMA_CENTER.zoom, style: { height: '100%', width: '100%', minHeight: '500px' }, children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), properties.map(property => (_jsx(Marker, { position: [property.lat, property.lng], children: _jsx(Popup, { children: _jsxs("div", { className: "min-w-[160px]", children: [_jsx("img", { src: property.images[0], alt: property.title, className: "mb-2 h-24 w-full rounded object-cover" }), _jsx("p", { className: "font-semibold text-gray-900 text-xs line-clamp-2", children: property.title }), _jsx("p", { className: "text-xs text-gray-500", children: property.district }), _jsxs("p", { className: "mt-1 font-bold text-blue-600 text-sm", children: [formatCurrency(property.pricePerNight), "/noche"] }), _jsx(Link, { to: `/properties/${property.id}`, className: "mt-2 block rounded bg-blue-600 px-2 py-1 text-center text-xs text-white hover:bg-blue-700", children: "Ver propiedad" })] }) }) }, property.id)))] }) }));
};
