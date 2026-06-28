from app.models.amenity import Amenity, AmenityCategory

AMENITY_CATEGORIES: list[AmenityCategory] = [
    AmenityCategory(
        title="Destacados",
        amenities=[
            Amenity(id="WIFI", name="WiFi de alta velocidad", icon="Wifi"),
            Amenity(id="POOL", name="Piscina", icon="Waves"),
            Amenity(id="PARKING", name="Estacionamiento", icon="Car"),
            Amenity(id="AIR_CONDITIONING", name="Aire acondicionado", icon="Wind"),
            Amenity(id="KITCHEN", name="Cocina equipada", icon="ChefHat"),
            Amenity(id="WASHER", name="Lavadora", icon="WashingMachine"),
        ],
    ),
    AmenityCategory(
        title="Baño",
        amenities=[
            Amenity(id="BATHTUB", name="Bañera", icon="Bath"),
            Amenity(id="HOT_WATER", name="Agua caliente 24h", icon="Droplets"),
        ],
    ),
    AmenityCategory(
        title="Entretenimiento",
        amenities=[
            Amenity(id="TV", name="Televisión", icon="Tv"),
            Amenity(id="NETFLIX", name="Netflix incluido", icon="Play"),
            Amenity(id="SOUND_SYSTEM", name="Sistema de sonido", icon="Music"),
        ],
    ),
    AmenityCategory(
        title="Trabajo y estudio",
        amenities=[
            Amenity(id="WORKSPACE", name="Espacio de trabajo", icon="Monitor"),
            Amenity(id="PRINTER", name="Impresora", icon="Printer"),
        ],
    ),
    AmenityCategory(
        title="Cocina",
        amenities=[
            Amenity(id="MICROWAVE", name="Microondas", icon="Microwave"),
            Amenity(id="DISHWASHER", name="Lavavajillas", icon="Utensils"),
            Amenity(id="COFFEE_MAKER", name="Cafetera", icon="Coffee"),
            Amenity(id="GRILL", name="Parrilla", icon="Flame"),
            Amenity(id="BREAKFAST", name="Desayuno incluido", icon="Sunrise"),
        ],
    ),
    AmenityCategory(
        title="Familia",
        amenities=[
            Amenity(id="FAMILY_FRIENDLY", name="Apto para familias", icon="Users"),
            Amenity(id="BABY_FRIENDLY", name="Apto para bebés", icon="Baby"),
            Amenity(id="CRIB", name="Cuna disponible", icon="Baby"),
            Amenity(id="PETS_ALLOWED", name="Mascotas permitidas", icon="PawPrint"),
        ],
    ),
    AmenityCategory(
        title="Seguridad",
        amenities=[
            Amenity(id="SMOKE_DETECTOR", name="Detector de humo", icon="AlertTriangle"),
            Amenity(id="CO_DETECTOR", name="Detector de CO", icon="Shield"),
            Amenity(id="WHEELCHAIR_ACCESSIBLE", name="Acceso para sillas de ruedas", icon="Accessibility"),
        ],
    ),
    AmenityCategory(
        title="Extras",
        amenities=[
            Amenity(id="EV_CHARGER", name="Cargador eléctrico", icon="Zap"),
            Amenity(id="KING_BED", name="Cama king size", icon="BedDouble"),
            Amenity(id="SMOKING_ALLOWED", name="Fumar permitido", icon="Cigarette"),
            Amenity(id="QUIET_HOURS", name="Horario de silencio", icon="VolumeX"),
        ],
    ),
]
