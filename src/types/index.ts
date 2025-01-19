// src/types/index.ts

export interface City {
    id: string;
    name: string;
    country: string;
    currency: string;
    latitude: number;
    longitude: number;
    costs?: CostItem[];
}
  
export interface CostItem {
    item: string;
    cost: number;
    range: {
      low: number;
      high: number;
    };
  }
  
export interface CityResponse {
    city: string;
    currency: string;
    costs: CostItem[];
    monthlyRent: number;
    monthlyFood: number;
    monthlyTransport: number;
    monthlyUtilities: number;
    monthlyLeisure: number;
    monthlyOther: number;
  }
  
export type ExpenseParameter = {
    amount: number;
    isShared: boolean;
  };
  
export interface AccommodationParameter extends ExpenseParameter {
    deposit: number;
    numberOfPeople: number;
  }
  
export interface BudgetParameters {
    accommodation: AccommodationParameter;
    utilities: ExpenseParameter;
    groceries: ExpenseParameter;
    transport: ExpenseParameter;
    entertainment: ExpenseParameter;
    dining: ExpenseParameter;
    leisure: ExpenseParameter;
    other: ExpenseParameter;
  }
  
export interface ScholarshipConfig {
    monthlyGrant: number;
    maxMonths: number;
    travelSupport: number;
    additionalSupport?: number;
  }
  
export interface Flight {
    id: string;
    description: string;
    price: number;
    date: string;
    isShared: boolean;
  }
  
export interface ExchangeRate {
    base: string;
    rates: Record<string, number>;
    lastUpdated: string;
  }

export interface NormalizedCity {
  id: string;
  country: string;
  city: string;
}