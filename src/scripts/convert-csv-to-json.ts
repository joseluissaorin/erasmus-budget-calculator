import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface CityData {
  Country: string;
  City: string;
}

interface NormalizedCity {
  id: string;
  country: string;
  city: string;
}

function normalizeString(str: string | undefined): string {
  if (!str) return '';
  return str.trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function main() {
  // Read CSV file
  const csvPath = path.join(process.cwd(), 'src', 'cities', 'COUNTRIES_Cities.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  }) as CityData[];

  // Normalize and deduplicate cities
  const citiesMap = new Map<string, NormalizedCity>();
  
  records.forEach((record) => {
    if (!record.Country || !record.City) {
      console.warn('Skipping invalid record:', record);
      return;
    }

    const normalizedCountry = normalizeString(record.Country);
    const normalizedCity = normalizeString(record.City);

    if (!normalizedCountry || !normalizedCity) {
      console.warn('Skipping record with empty values:', record);
      return;
    }

    const id = `${normalizedCountry}-${normalizedCity}`.toLowerCase().replace(/\s+/g, '-');
    
    citiesMap.set(id, {
      id,
      country: normalizedCountry,
      city: normalizedCity
    });
  });

  // Convert to array and sort
  const cities = Array.from(citiesMap.values()).sort((a, b) => {
    const countryCompare = a.country.localeCompare(b.country);
    return countryCompare !== 0 ? countryCompare : a.city.localeCompare(b.city);
  });

  // Write JSON file
  const jsonPath = path.join(process.cwd(), 'src', 'data', 'cities.json');
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(cities, null, 2));

  console.log(`Converted ${cities.length} cities to JSON`);
  console.log(`Original CSV had ${records.length} entries`);
}

main(); 