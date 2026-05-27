import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Avatar } from '@/shared/components/ui/Avatar';
import { StarRating } from './StarRating';
import { formatDate } from '@/shared/utils/formatters';
export const ReviewCard = ({ review }) => (_jsxs("div", { className: "rounded-2xl border border-gray-100 bg-white p-4", children: [_jsxs("div", { className: "mb-3 flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Avatar, { src: review.reviewerAvatar, alt: review.reviewerFirstName, size: "md" }), _jsxs("div", { children: [_jsxs("p", { className: "font-medium text-gray-900", children: [review.reviewerFirstName, " ", review.reviewerLastName] }), _jsx("p", { className: "text-xs text-gray-400", children: formatDate(review.createdAt) })] })] }), _jsx(StarRating, { rating: review.rating, size: "sm" })] }), _jsx("p", { className: "text-sm leading-relaxed text-gray-600", children: review.comment })] }));
