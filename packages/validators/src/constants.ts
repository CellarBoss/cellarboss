export const BOTTLE_STATUSES = ['ordered', 'stored', 'in-primeur', 'drunk', 'sold', 'gifted'] as const;
export type BottleStatus = typeof BOTTLE_STATUSES[number];

export const WINE_TYPES = ['red', 'white', 'rose', 'orange', 'sparkling', 'fortified', 'dessert'] as const;
export type WineType = typeof WINE_TYPES[number];
