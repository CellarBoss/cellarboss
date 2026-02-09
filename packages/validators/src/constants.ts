export const BOTTLE_STATUSES = ['ordered', 'stored', 'in-primeur', 'drunk', 'sold', 'gifted'] as const;
export type BottleStatus = typeof BOTTLE_STATUSES[number];
