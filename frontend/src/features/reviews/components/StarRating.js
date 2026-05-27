import { jsx as _jsx } from "react/jsx-runtime";
import { Star } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
const sizeMap = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' };
export const StarRating = ({ rating, max = 5, size = 'md', className }) => (_jsx("div", { className: cn('flex items-center gap-0.5', className), children: Array.from({ length: max }).map((_, i) => (_jsx(Star, { className: cn(sizeMap[size], i < Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200') }, i))) }));
