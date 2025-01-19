import { City, CityResponse } from '@/types';

const DB_NAME = 'ErasmusBudgetDB';
const DB_VERSION = 1;

export interface StoredCity extends City {
  lastUpdated: number;
  isSelected: boolean;
}

export interface StoredCosts extends CityResponse {
  id: string;
  cityId: string;
  currency: string;
  timestamp: number;
}

export interface StoredPreference {
  path: string;
  value: any;
  timestamp: number;
}

export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create cities store
      if (!db.objectStoreNames.contains('cities')) {
        const citiesStore = db.createObjectStore('cities', { keyPath: 'id' });
        citiesStore.createIndex('country', 'country', { unique: false });
        citiesStore.createIndex('name', 'name', { unique: false });
      }

      // Create costs store
      if (!db.objectStoreNames.contains('costs')) {
        const costsStore = db.createObjectStore('costs', { keyPath: 'id' });
        costsStore.createIndex('cityId', 'cityId', { unique: false });
        costsStore.createIndex('currency', 'currency', { unique: false });
      }

      // Create preferences store
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'path' });
      }
    };
  });
}

export async function storeCity(city: City, isSelected: boolean = false): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction('cities', 'readwrite');
  const store = transaction.objectStore('cities');

  const storedCity: StoredCity = {
    ...city,
    lastUpdated: Date.now(),
    isSelected
  };

  return new Promise((resolve, reject) => {
    const request = store.put(storedCity);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function storeCosts(cityId: string, costs: CityResponse, currency: string): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction('costs', 'readwrite');
  const store = transaction.objectStore('costs');

  const storedCosts: StoredCosts = {
    ...costs,
    id: `${cityId}_${currency}`,
    cityId,
    currency,
    timestamp: Date.now()
  };

  return new Promise((resolve, reject) => {
    const request = store.put(storedCosts);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function storePreference(path: string, value: any): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction('preferences', 'readwrite');
  const store = transaction.objectStore('preferences');

  const storedPreference: StoredPreference = {
    path,
    value,
    timestamp: Date.now()
  };

  return new Promise((resolve, reject) => {
    const request = store.put(storedPreference);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getCity(cityId: string): Promise<StoredCity | null> {
  const db = await openDatabase();
  const transaction = db.transaction('cities', 'readonly');
  const store = transaction.objectStore('cities');

  return new Promise((resolve, reject) => {
    const request = store.get(cityId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function getCosts(cityId: string, currency: string): Promise<StoredCosts | null> {
  const db = await openDatabase();
  const transaction = db.transaction('costs', 'readonly');
  const store = transaction.objectStore('costs');

  return new Promise((resolve, reject) => {
    const request = store.get(`${cityId}_${currency}`);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function getPreference<T>(path: string): Promise<T | null> {
  const db = await openDatabase();
  const transaction = db.transaction('preferences', 'readonly');
  const store = transaction.objectStore('preferences');

  return new Promise((resolve, reject) => {
    const request = store.get(path);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result?.value || null);
  });
}

export async function deleteCity(cityId: string): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction('cities', 'readwrite');
  const store = transaction.objectStore('cities');

  return new Promise((resolve, reject) => {
    const request = store.delete(cityId);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteCosts(cityId: string, currency: string): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction('costs', 'readwrite');
  const store = transaction.objectStore('costs');

  return new Promise((resolve, reject) => {
    const request = store.delete(`${cityId}_${currency}`);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deletePreference(path: string): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction('preferences', 'readwrite');
  const store = transaction.objectStore('preferences');

  return new Promise((resolve, reject) => {
    const request = store.delete(path);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
} 