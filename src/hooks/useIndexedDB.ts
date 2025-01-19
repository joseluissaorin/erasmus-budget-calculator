"use client";

import { useState, useCallback } from 'react';
import { City, CityResponse } from '@/types';
import * as db from '@/lib/db';

interface UseIndexedDBReturn {
  // City operations
  saveCity: (city: City, isSelected?: boolean) => Promise<void>;
  getStoredCity: (cityId: string) => Promise<db.StoredCity | null>;
  removeCity: (cityId: string) => Promise<void>;
  
  // Costs operations
  saveCosts: (cityId: string, costs: CityResponse, currency: string) => Promise<void>;
  getStoredCosts: (cityId: string, currency: string) => Promise<db.StoredCosts | null>;
  removeCosts: (cityId: string, currency: string) => Promise<void>;
  
  // Preferences operations
  savePreference: (path: string, value: any) => Promise<void>;
  getPreference: <T>(path: string) => Promise<T | null>;
  removePreference: (path: string) => Promise<void>;
  
  // Error state
  error: Error | null;
}

export function useIndexedDB(): UseIndexedDBReturn {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (err: any) => {
    console.error('IndexedDB Error:', err);
    setError(err instanceof Error ? err : new Error(String(err)));
  };

  const saveCity = useCallback(async (city: City, isSelected = false) => {
    try {
      await db.storeCity(city, isSelected);
    } catch (err) {
      handleError(err);
    }
  }, []);

  const getStoredCity = useCallback(async (cityId: string) => {
    try {
      return await db.getCity(cityId);
    } catch (err) {
      handleError(err);
      return null;
    }
  }, []);

  const removeCity = useCallback(async (cityId: string) => {
    try {
      await db.deleteCity(cityId);
    } catch (err) {
      handleError(err);
    }
  }, []);

  const saveCosts = useCallback(async (cityId: string, costs: CityResponse, currency: string) => {
    try {
      await db.storeCosts(cityId, costs, currency);
    } catch (err) {
      handleError(err);
    }
  }, []);

  const getStoredCosts = useCallback(async (cityId: string, currency: string) => {
    try {
      return await db.getCosts(cityId, currency);
    } catch (err) {
      handleError(err);
      return null;
    }
  }, []);

  const removeCosts = useCallback(async (cityId: string, currency: string) => {
    try {
      await db.deleteCosts(cityId, currency);
    } catch (err) {
      handleError(err);
    }
  }, []);

  const savePreference = useCallback(async (path: string, value: any) => {
    try {
      await db.storePreference(path, value);
    } catch (err) {
      handleError(err);
    }
  }, []);

  const getPreference = useCallback(async <T>(path: string): Promise<T | null> => {
    try {
      return await db.getPreference<T>(path);
    } catch (err) {
      handleError(err);
      return null;
    }
  }, []);

  const removePreference = useCallback(async (path: string) => {
    try {
      await db.deletePreference(path);
    } catch (err) {
      handleError(err);
    }
  }, []);

  return {
    saveCity,
    getStoredCity,
    removeCity,
    saveCosts,
    getStoredCosts,
    removeCosts,
    savePreference,
    getPreference,
    removePreference,
    error
  };
} 