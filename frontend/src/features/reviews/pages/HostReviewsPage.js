import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/core/auth/useAuth';
import { reviewService } from '../services/review.service';
import { propertyService } from '@/features/properties/services/property.service';
import { ReviewCard } from '../components/ReviewCard';
import { ReviewStats } from '../components/ReviewStats';
import { Spinner } from '@/shared/components/ui/Spinner';
import { EmptyState } from '@/shared/components/feedback/EmptyState';
export const HostReviewsPage = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!user)
            return;
        const fetchReviews = async () => {
            const properties = await propertyService.getByHostId(user.id);
            const propertyIds = properties.map(p => p.id);
            const data = await reviewService.getByHostId(user.id, propertyIds);
            setReviews(data);
            setLoading(false);
        };
        fetchReviews();
    }, [user]);
    if (loading)
        return (_jsx("div", { className: "flex justify-center py-20", children: _jsx(Spinner, {}) }));
    return (_jsxs("div", { children: [_jsx("h2", { className: "mb-6 text-xl font-bold text-gray-900", children: "Rese\u00F1as de tus propiedades" }), reviews.length > 0 && (_jsx("div", { className: "mb-8 rounded-2xl border border-gray-100 bg-white p-6", children: _jsx(ReviewStats, { reviews: reviews }) })), reviews.length === 0 ? (_jsx(EmptyState, { icon: _jsx(Star, { className: "h-12 w-12" }), title: "A\u00FAn no tienes rese\u00F1as", description: "Las rese\u00F1as de tus hu\u00E9spedes aparecer\u00E1n aqu\u00ED una vez que completen su estad\u00EDa." })) : (_jsx("div", { className: "flex flex-col gap-4", children: reviews.map(review => (_jsx(ReviewCard, { review: review }, review.id))) }))] }));
};
