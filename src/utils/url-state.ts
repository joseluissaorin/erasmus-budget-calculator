import { BudgetParameters, ScholarshipConfig, Flight, City } from '../types';
import * as LZString from 'lz-string';

// Convert number to base64 for shorter strings
const encodeNumber = (num: number): string => {
  const buffer = new ArrayBuffer(8);
  new Float64Array(buffer)[0] = num;
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

const decodeNumber = (str: string): number => {
  try {
    const binary = atob(str);
    const buffer = new ArrayBuffer(8);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) {
      view[i] = binary.charCodeAt(i);
    }
    return new Float64Array(buffer)[0];
  } catch (error) {
    console.error('Error decoding number:', error);
    return 0;
  }
};

// Encode boolean as 0/1 in base64
const encodeBoolean = (bool: boolean): string => btoa(bool ? '1' : '0');
const decodeBoolean = (str: string): boolean => {
  try {
    return atob(str) === '1';
  } catch (error) {
    console.error('Error decoding boolean:', error);
    return false;
  }
};

// Encode string with base64 and compression
const encodeString = (str: string): string => {
  try {
    return LZString.compressToBase64(encodeURIComponent(str));
  } catch (error) {
    console.error('Error encoding string:', error);
    return '';
  }
};

const decodeString = (str: string): string => {
  try {
    return decodeURIComponent(LZString.decompressFromBase64(str) || '');
  } catch (error) {
    console.error('Error decoding string:', error);
    return '';
  }
};

// Encode expense parameter
const encodeExpenseParam = (param: { amount: number; isShared: boolean }): string => {
  return [
    encodeNumber(param.amount),
    encodeBoolean(param.isShared)
  ].join('|');
};

// Decode expense parameter
const decodeExpenseParam = (encoded: string): { amount: number; isShared: boolean } => {
  const [amount, isShared] = encoded.split('|');
  return {
    amount: decodeNumber(amount),
    isShared: decodeBoolean(isShared)
  };
};

export const encodeBudgetParams = (params: BudgetParameters): string => {
  try {
    const encoded = {
      accommodation: {
        amount: encodeNumber(params.accommodation.amount),
        deposit: encodeNumber(params.accommodation.deposit),
        isShared: encodeBoolean(params.accommodation.isShared),
        numberOfPeople: encodeNumber(params.accommodation.numberOfPeople)
      },
      utilities: encodeExpenseParam(params.utilities),
      groceries: encodeExpenseParam(params.groceries),
      transport: encodeExpenseParam(params.transport),
      entertainment: encodeExpenseParam(params.entertainment),
      dining: encodeExpenseParam(params.dining),
      leisure: encodeExpenseParam(params.leisure),
      other: encodeExpenseParam(params.other)
    };
    
    return LZString.compressToBase64(JSON.stringify(encoded));
  } catch (error) {
    console.error('Error encoding budget parameters:', error);
    throw new Error('Failed to encode budget parameters');
  }
};

export const decodeBudgetParams = (encoded: string): BudgetParameters => {
  try {
    const decoded = JSON.parse(LZString.decompressFromBase64(encoded) || '{}');
    
    return {
      accommodation: {
        amount: decodeNumber(decoded.accommodation.amount),
        deposit: decodeNumber(decoded.accommodation.deposit),
        isShared: decodeBoolean(decoded.accommodation.isShared),
        numberOfPeople: decodeNumber(decoded.accommodation.numberOfPeople)
      },
      utilities: decodeExpenseParam(decoded.utilities),
      groceries: decodeExpenseParam(decoded.groceries),
      transport: decodeExpenseParam(decoded.transport),
      entertainment: decodeExpenseParam(decoded.entertainment),
      dining: decodeExpenseParam(decoded.dining),
      leisure: decodeExpenseParam(decoded.leisure),
      other: decodeExpenseParam(decoded.other)
    };
  } catch (error) {
    console.error('Error decoding budget parameters:', error);
    return {
      accommodation: { amount: 0, deposit: 0, isShared: false, numberOfPeople: 1 },
      utilities: { amount: 0, isShared: false },
      groceries: { amount: 0, isShared: false },
      transport: { amount: 0, isShared: false },
      entertainment: { amount: 0, isShared: false },
      dining: { amount: 0, isShared: false },
      leisure: { amount: 0, isShared: false },
      other: { amount: 0, isShared: false }
    };
  }
};

export const encodeFlights = (flights: Flight[]): string => {
  try {
    const encoded = flights.map(f => ({
      id: encodeString(f.id),
      price: encodeNumber(f.price),
      description: encodeString(f.description),
      date: encodeString(f.date),
      isShared: encodeBoolean(f.isShared)
    }));
    
    return LZString.compressToBase64(JSON.stringify(encoded));
  } catch (error) {
    console.error('Error encoding flights:', error);
    throw new Error('Failed to encode flights');
  }
};

export const decodeFlights = (encoded: string): Flight[] => {
  try {
    if (!encoded) return [];
    
    const decoded = JSON.parse(LZString.decompressFromBase64(encoded) || '[]');
    return decoded.map((f: any) => ({
      id: decodeString(f.id),
      price: decodeNumber(f.price),
      description: decodeString(f.description),
      date: decodeString(f.date),
      isShared: decodeBoolean(f.isShared)
    }));
  } catch (error) {
    console.error('Error decoding flights:', error);
    return [];
  }
};

export const encodeScholarship = (scholarship: ScholarshipConfig): string => {
  try {
    const encoded = {
      monthlyGrant: encodeNumber(scholarship.monthlyGrant),
      maxMonths: encodeNumber(scholarship.maxMonths),
      travelSupport: encodeNumber(scholarship.travelSupport),
      additionalSupport: scholarship.additionalSupport ? encodeNumber(scholarship.additionalSupport) : null
    };
    
    return LZString.compressToBase64(JSON.stringify(encoded));
  } catch (error) {
    console.error('Error encoding scholarship:', error);
    throw new Error('Failed to encode scholarship');
  }
};

export const decodeScholarship = (encoded: string): ScholarshipConfig => {
  try {
    const decoded = JSON.parse(LZString.decompressFromBase64(encoded) || '{}');
    
    return {
      monthlyGrant: decodeNumber(decoded.monthlyGrant),
      maxMonths: decodeNumber(decoded.maxMonths),
      travelSupport: decodeNumber(decoded.travelSupport),
      additionalSupport: decoded.additionalSupport ? decodeNumber(decoded.additionalSupport) : 0
    };
  } catch (error) {
    console.error('Error decoding scholarship:', error);
    return {
      monthlyGrant: 0,
      maxMonths: 0,
      travelSupport: 0,
      additionalSupport: 0
    };
  }
};

export interface SharedState {
  cityId: string;
  budgetParams: BudgetParameters;
  flights: Flight[];
  scholarship: ScholarshipConfig;
  stayDuration: number;
}

export const encodeState = (state: SharedState): string => {
  try {
    const encoded = {
      c: encodeString(state.cityId),
      b: encodeBudgetParams(state.budgetParams),
      f: encodeFlights(state.flights),
      s: encodeScholarship(state.scholarship),
      d: encodeNumber(state.stayDuration)
    };
    
    return LZString.compressToEncodedURIComponent(JSON.stringify(encoded));
  } catch (error) {
    console.error('Error encoding state:', error);
    throw new Error('Failed to encode state');
  }
};

export const decodeState = (encoded: string): SharedState | null => {
  try {
    if (!encoded) return null;
    
    const jsonStr = LZString.decompressFromEncodedURIComponent(encoded);
    if (!jsonStr) return null;
    
    const decoded = JSON.parse(jsonStr);
    
    return {
      cityId: decodeString(decoded.c),
      budgetParams: decodeBudgetParams(decoded.b),
      flights: decodeFlights(decoded.f),
      scholarship: decodeScholarship(decoded.s),
      stayDuration: decodeNumber(decoded.d)
    };
  } catch (error) {
    console.error('Error decoding state:', error);
    return null;
  }
}; 