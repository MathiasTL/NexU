import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { reviewService } from '@/features/reviews/services/review.service';
import { ReviewCard } from '@/features/reviews/components/ReviewCard';
import { ReviewStats } from '@/features/reviews/components/ReviewStats';
import { Spinner } from '@/shared/components/ui/Spinner';
export const PropertyReviews = ({ propertyId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        reviewService.getByPropertyId(propertyId).then(data => {
            setReviews(data);
            setLoading(false);
        });
    }, [propertyId]);
    if (loading)
        return _jsx("div", { className: "flex justify-center py-8", children: _jsx(Spinner, {}) });
    if (!reviews.length)
        return null;
    return (_jsxs("div", { children: [_jsx("h2", { className: "mb-6 text-xl font-semibold text-gray-900", children: "Rese\u00F1as" }), _jsx("div", { className: "mb-6", children: _jsx(ReviewStats, { reviews: reviews }) }), _jsx("div", { className: "grid gap-4 sm:grid-cols-2", children: reviews.map(review => (_jsx(ReviewCard, { review: review }, review.id))) })] }));
};
