import { BOOKINGS_MOCK } from '@/mock/bookings.mock';
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));
export const bookingService = {
    getByTenantId: async (tenantId) => {
        await delay();
        return BOOKINGS_MOCK.filter(b => b.tenantId === tenantId);
    },
    getByHostId: async (hostId) => {
        await delay();
        return BOOKINGS_MOCK.filter(b => b.hostId === hostId);
    },
    create: async (payload) => {
        await delay(1500);
        const newBooking = {
            id: BOOKINGS_MOCK.length + 1,
            ...payload,
            guestMessage: payload.guestMessage ?? null,
            hostNote: null,
            status: 'confirmed',
            createdAt: new Date().toISOString().split('T')[0],
        };
        BOOKINGS_MOCK.push(newBooking);
        return newBooking;
    },
    updateStatus: async (id, status) => {
        await delay();
        const booking = BOOKINGS_MOCK.find(b => b.id === id);
        if (booking)
            booking.status = status;
    },
};
