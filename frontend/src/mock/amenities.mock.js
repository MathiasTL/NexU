export const AMENITY_CATEGORIES = [
    {
        title: 'Servicios Destacados',
        amenities: [
            { id: 'WIFI', name: 'WiFi', icon: 'Wifi' },
            { id: 'POOL', name: 'Piscina', icon: 'Waves' },
            { id: 'PARKING', name: 'Estacionamiento', icon: 'Car' },
            { id: 'AIR_CONDITIONING', name: 'Aire acondicionado', icon: 'Wind' },
            { id: 'KITCHEN', name: 'Cocina', icon: 'ChefHat' },
            { id: 'WASHER', name: 'Lavadora', icon: 'WashingMachine' },
        ],
    },
    {
        title: 'Baño',
        amenities: [
            { id: 'BATHTUB', name: 'Tina', icon: 'Bath' },
            { id: 'HOT_WATER', name: 'Agua caliente', icon: 'Thermometer' },
        ],
    },
    {
        title: 'Entretenimiento',
        amenities: [
            { id: 'TV', name: 'TV', icon: 'Tv' },
            { id: 'NETFLIX', name: 'Netflix', icon: 'Play' },
            { id: 'SOUND_SYSTEM', name: 'Sistema de sonido', icon: 'Music' },
        ],
    },
    {
        title: 'Trabajo',
        amenities: [
            { id: 'WORKSPACE', name: 'Escritorio de trabajo', icon: 'Monitor' },
            { id: 'PRINTER', name: 'Impresora', icon: 'Printer' },
        ],
    },
    {
        title: 'Cocina',
        amenities: [
            { id: 'MICROWAVE', name: 'Microondas', icon: 'Zap' },
            { id: 'DISHWASHER', name: 'Lavavajillas', icon: 'Droplets' },
            { id: 'COFFEE_MAKER', name: 'Cafetera', icon: 'Coffee' },
            { id: 'GRILL', name: 'Parrilla', icon: 'Flame' },
            { id: 'BREAKFAST', name: 'Desayuno incluido', icon: 'Sunrise' },
        ],
    },
    {
        title: 'Familia y Mascotas',
        amenities: [
            { id: 'FAMILY_FRIENDLY', name: 'Apto para familias', icon: 'Users' },
            { id: 'BABY_FRIENDLY', name: 'Apto para bebés', icon: 'Baby' },
            { id: 'CRIB', name: 'Cuna', icon: 'Star' },
            { id: 'PETS_ALLOWED', name: 'Se permiten mascotas', icon: 'PawPrint' },
        ],
    },
    {
        title: 'Seguridad',
        amenities: [
            { id: 'SMOKE_DETECTOR', name: 'Detector de humo', icon: 'AlertTriangle' },
            { id: 'CO_DETECTOR', name: 'Detector de monóxido', icon: 'Shield' },
            { id: 'WHEELCHAIR_ACCESSIBLE', name: 'Acceso silla de ruedas', icon: 'Accessibility' },
        ],
    },
    {
        title: 'Extras',
        amenities: [
            { id: 'EV_CHARGER', name: 'Cargador EV', icon: 'BatteryCharging' },
            { id: 'KING_BED', name: 'Cama King', icon: 'BedDouble' },
            { id: 'SMOKING_ALLOWED', name: 'Se permite fumar', icon: 'Cigarette' },
            { id: 'QUIET_HOURS', name: 'Horario de silencio', icon: 'VolumeX' },
        ],
    },
];
export const ALL_AMENITIES = AMENITY_CATEGORIES.flatMap(c => c.amenities);
