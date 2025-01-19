import { City } from '@/types';
import cities from '@/data/cities.json';

export const getCityById = (id: string): City | null => {
  const city = cities.find(c => c.id === id);
  if (!city) return null;
  
  return {
    id: city.id,
    name: city.city,
    country: city.country,
    currency: 'EUR', // Default to EUR since we don't store currency in cities.json
    latitude: 0, // These aren't stored in cities.json
    longitude: 0
  };
}; 