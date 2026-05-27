import { REVIEWS_MOCK } from '@/mock/reviews.mock';
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));
export const reviewService = {
    getByPropertyId: async (propertyId) => {
        await delay();
        return REVIEWS_MOCK.filter(r => r.propertyId === propertyId);
    },
    getByHostId: async (_hostId, propertyIds) => {
        await delay();
        return REVIEWS_MOCK.filter(r => propertyIds.includes(r.propertyId));
    },
    getAverageRating: (reviews) => {
        if (!reviews.length)
            return 0;
        return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    },
};
