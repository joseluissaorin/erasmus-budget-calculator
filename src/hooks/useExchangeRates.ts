// hooks/useExchangeRates.ts

import { useState, useEffect } from 'react';
import { ExchangeRate } from '../types';

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/EUR';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export interface UseExchangeRatesReturn {
  rates: ExchangeRate | null;
  loading: boolean;
  error: Error | null;
  convertCurrency: (amount: number, from: string, to: string) => number;
}

export function useExchangeRates(): UseExchangeRatesReturn {
  const [rates, setRates] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Check cache first
        const cachedRates = localStorage.getItem('exchangeRates');
        const cachedTimestamp = localStorage.getItem('exchangeRatesTimestamp');

        if (cachedRates && cachedTimestamp) {
          const timestamp = parseInt(cachedTimestamp);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setRates(JSON.parse(cachedRates));
            setLoading(false);
            return;
          }
        }

        // Fetch fresh rates
        const response = await fetch(EXCHANGE_API_URL);
        const data = await response.json();

        const ratesData: ExchangeRate = {
          base: data.base,
          rates: data.rates,
          lastUpdated: new Date().toISOString()
        };

        // Update cache
        localStorage.setItem('exchangeRates', JSON.stringify(ratesData));
        localStorage.setItem('exchangeRatesTimestamp', Date.now().toString());

        setRates(ratesData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch exchange rates'));
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const convertCurrency = (amount: number, from: string, to: string): number => {
    if (!rates || !rates.rates[from] || !rates.rates[to]) {
      return amount;
    }

    const eurAmount = amount / rates.rates[from];
    return eurAmount * rates.rates[to];
  };

  return { rates, loading, error, convertCurrency };
}