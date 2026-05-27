import { PROPERTIES_MOCK } from '@/mock/properties.mock';
const delay = (ms = 400) => new Promise(res => setTimeout(res, ms));
export const propertyService = {
    getAll: async () => {
        await delay();
        return PROPERTIES_MOCK.filter(p => p.status === 'active');
    },
    getById: async (id) => {
        await delay();
        return PROPERTIES_MOCK.find(p => p.id === id) ?? null;
    },
    getByHostId: async (hostId) => {
        await delay();
        return PROPERTIES_MOCK.filter(p => p.hostId === hostId);
    },
    search: async (filters) => {
        await delay();
        return PROPERTIES_MOCK.filter(p => {
            if (p.status !== 'active')
                return false;
            if (filters.query &&
                !p.title.toLowerCase().includes(filters.query.toLowerCase()) &&
                !p.district.toLowerCase().includes(filters.query.toLowerCase()))
                return false;
            if (filters.district && !p.district.toLowerCase().includes(filters.district.toLowerCase()))
                return false;
            if (filters.maxPrice && p.pricePerNight > filters.maxPrice)
                return false;
            if (filters.minPrice && p.pricePerNight < filters.minPrice)
                return false;
            if (filters.capacity && p.capacity < filters.capacity)
                return false;
            if (filters.amenities?.length) {
                if (!filters.amenities.every(a => p.amenities.includes(a)))
                    return false;
            }
            if (filters.bedrooms != null && p.bedrooms < filters.bedrooms)
                return false;
            if (filters.bathrooms != null && p.bathrooms < filters.bathrooms)
                return false;
            if (filters.quickFilter === 'individual' && (p.capacity > 2 || p.bedrooms > 1))
                return false;
            if (filters.quickFilter === 'shared' && p.capacity <= 2 && p.bedrooms <= 1)
                return false;
            if (filters.quickFilter === 'petFriendly' && !p.amenities.includes('PETS_ALLOWED'))
                return false;
            return true;
        });
    },
    create: async (data) => {
        await delay(800);
        const newProp = {
            id: PROPERTIES_MOCK.length + 1,
            hostId: data.hostId,
            title: data.title ?? 'Nueva propiedad',
            description: data.description ?? '',
            shortDescription: data.shortDescription ?? '',
            pricePerNight: data.pricePerNight ?? 100,
            currency: 'PEN',
            location: data.location ?? '',
            district: data.district ?? '',
            city: 'Lima',
            country: 'Perú',
            lat: data.lat ?? -12.0464,
            lng: data.lng ?? -77.0428,
            images: data.images ?? [],
            amenities: data.amenities ?? [],
            capacity: data.capacity ?? 2,
            bedrooms: data.bedrooms ?? 1,
            beds: data.beds ?? 1,
            bathrooms: data.bathrooms ?? 1,
            rating: 0,
            reviewsCount: 0,
            checkinTime: '15:00',
            checkoutTime: '11:00',
            houseRules: [],
            status: 'active',
            createdAt: new Date().toISOString().split('T')[0],
        };
        PROPERTIES_MOCK.push(newProp);
        return newProp;
    },
};
