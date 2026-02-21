export function formatPrice(price: number | string, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  } catch {
    // Fallback if currency is invalid
    return `${Number(price).toFixed(2)} ${currency}`;
  }
}

import { format } from 'date-fns';

// TODO: This is a very simple wrapper. In future, deprecate the dateFormat parameter and fetch the setting from this function
export function formatDate(dateStr: string, dateFormat: string): string {
  return format(dateStr, dateFormat);
}

export function formatStatus(status: string): string {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDrinkingWindow(begin: number | null, end: number | null): string {
  if(begin !== null && end !== null) return `${begin} until ${end}`;
  if(begin === null && end !== null) return `Now until ${end}`;
  if(begin !== null) return `From ${begin}`;
  if(end !== null) return `Until ${end}`;
  return "-";
}

export type DrinkingStatus = 'drinkable' | 'wait' | 'past' | 'unknown';

export function formatDrinkingStatus(drinkFrom: number | null, drinkUntil: number | null, currentYear: number): DrinkingStatus {
  if (drinkFrom === null && drinkUntil === null) {
    return 'unknown';
  }
  
  if (drinkUntil !== null && currentYear > drinkUntil) {
    return 'past';
  }
  
  if (drinkFrom !== null && currentYear < drinkFrom) {
    return 'wait';
  }
  
  return 'drinkable';
}