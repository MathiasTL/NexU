import { BOOKINGS_MOCK } from '@/mock/bookings.mock';
import { REVIEWS_MOCK } from '@/mock/reviews.mock';
import { PROPERTIES_MOCK } from '@/mock/properties.mock';
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));
export const hostService = {
    getDashboardStats: async (hostId) => {
        await delay();
        const hostBookings = BOOKINGS_MOCK.filter(b => b.hostId === hostId && b.status !== 'cancelled');
        const hostPropertyIds = PROPERTIES_MOCK.filter(p => p.hostId === hostId).map(p => p.id);
        const hostReviews = REVIEWS_MOCK.filter(r => hostPropertyIds.includes(r.propertyId));
        const totalRevenue = hostBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.totalAmount, 0);
        const averageRating = hostReviews.length ? hostReviews.reduce((sum, r) => sum + r.rating, 0) / hostReviews.length : 0;
        const completedBookings = hostBookings.filter(b => b.status === 'completed');
        const averageTicket = completedBookings.length ? totalRevenue / completedBookings.length : 0;
        return {
            totalBookings: hostBookings.length,
            totalRevenue,
            averageRating: parseFloat(averageRating.toFixed(1)),
            averageTicket: Math.round(averageTicket),
        };
    },
    getRecentActivity: async (hostId) => {
        await delay();
        const bookings = BOOKINGS_MOCK.filter(b => b.hostId === hostId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4);
        return bookings;
    },
};
