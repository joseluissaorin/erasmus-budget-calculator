import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const countryToFlag: { [key: string]: string } = {
  'Austria': '🇦🇹',
  'Belgium': '🇧🇪',
  'Bulgaria': '🇧🇬',
  'Croatia': '🇭🇷',
  'Czech Republic': '🇨🇿',
  'Denmark': '🇩🇰',
  'Estonia': '🇪🇪',
  'Finland': '🇫🇮',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Greece': '🇬🇷',
  'Hungary': '🇭🇺',
  'Ireland': '🇮🇪',
  'Italy': '🇮🇹',
  'Latvia': '🇱🇻',
  'Lithuania': '🇱🇹',
  'Netherlands': '🇳🇱',
  'North Macedonia': '🇲🇰',
  'Norway': '🇳🇴',
  'Poland': '🇵🇱',
  'Portugal': '🇵🇹',
  'Romania': '🇷🇴',
  'Slovakia': '🇸🇰',
  'Slovenia': '🇸🇮',
  'Spain': '🇪🇸',
  'Sweden': '🇸🇪',
  'Switzerland': '🇨🇭',
  'United Kingdom': '🇬🇧'
};

export function getCountryFlag(country: string): string {
  return countryToFlag[country] || '🏳️';
}

export function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
