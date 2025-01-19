import { BudgetParameters, ScholarshipConfig, Flight, City } from '../types';

// Convert number to base36 for shorter strings
const encodeNumber = (num: number): string => Math.round(num * 100).toString(36);
const decodeNumber = (str: string): number => parseInt(str, 36) / 100;

// Encode boolean as 0/1
const encodeBoolean = (bool: boolean): string => bool ? '1' : '0';
const decodeBoolean = (str: string): boolean => str === '1';

export const encodeBudgetParams = (params: BudgetParameters): string => {
  const { accommodation, utilities, groceries, transport, entertainment, dining, leisure, other } = params;
  return [
    encodeNumber(accommodation.amount),
    encodeNumber(accommodation.deposit),
    encodeBoolean(accommodation.isShared),
    accommodation.numberOfPeople.toString(36),
    encodeNumber(utilities.amount),
    encodeBoolean(utilities.isShared),
    encodeNumber(groceries.amount),
    encodeBoolean(groceries.isShared),
    encodeNumber(transport.amount),
    encodeBoolean(transport.isShared),
    encodeNumber(entertainment.amount),
    encodeBoolean(entertainment.isShared),
    encodeNumber(dining.amount),
    encodeBoolean(dining.isShared),
    encodeNumber(leisure.amount),
    encodeBoolean(leisure.isShared),
    encodeNumber(other.amount),
    encodeBoolean(other.isShared)
  ].join(',');
};

export const decodeBudgetParams = (encoded: string): BudgetParameters => {
  const parts = encoded.split(',');
  return {
    accommodation: {
      amount: decodeNumber(parts[0]),
      deposit: decodeNumber(parts[1]),
      isShared: decodeBoolean(parts[2]),
      numberOfPeople: parseInt(parts[3], 36)
    },
    utilities: {
      amount: decodeNumber(parts[4]),
      isShared: decodeBoolean(parts[5])
    },
    groceries: {
      amount: decodeNumber(parts[6]),
      isShared: decodeBoolean(parts[7])
    },
    transport: {
      amount: decodeNumber(parts[8]),
      isShared: decodeBoolean(parts[9])
    },
    entertainment: {
      amount: decodeNumber(parts[10]),
      isShared: decodeBoolean(parts[11])
    },
    dining: {
      amount: decodeNumber(parts[12]),
      isShared: decodeBoolean(parts[13])
    },
    leisure: {
      amount: decodeNumber(parts[14]),
      isShared: decodeBoolean(parts[15])
    },
    other: {
      amount: decodeNumber(parts[16]),
      isShared: decodeBoolean(parts[17])
    }
  };
};

export const encodeFlights = (flights: Flight[]): string => {
  return flights.map(f => [
    f.id,
    encodeNumber(f.price),
    f.description,
    f.date,
    encodeBoolean(f.isShared)
  ].join('|')).join(';');
};

export const decodeFlights = (encoded: string): Flight[] => {
  if (!encoded) return [];
  return encoded.split(';').map(f => {
    const [id, price, description, date, isShared] = f.split('|');
    return {
      id,
      price: decodeNumber(price),
      description,
      date,
      isShared: decodeBoolean(isShared)
    };
  });
};

export const encodeScholarship = (scholarship: ScholarshipConfig): string => {
  return [
    encodeNumber(scholarship.monthlyGrant),
    scholarship.maxMonths.toString(36),
    encodeNumber(scholarship.travelSupport)
  ].join(',');
};

export const decodeScholarship = (encoded: string): ScholarshipConfig => {
  const [monthlyGrant, maxMonths, travelSupport] = encoded.split(',');
  return {
    monthlyGrant: decodeNumber(monthlyGrant),
    maxMonths: parseInt(maxMonths, 36),
    travelSupport: decodeNumber(travelSupport)
  };
};

export const encodeState = (
  city: City,
  stayDuration: number,
  budgetParams: BudgetParameters,
  flights: Flight[],
  scholarship: ScholarshipConfig
): string => {
  return [
    city.id,
    stayDuration.toString(36),
    encodeBudgetParams(budgetParams),
    encodeFlights(flights),
    encodeScholarship(scholarship)
  ].join('~');
};

export const decodeState = (encoded: string): {
  cityId: string;
  stayDuration: number;
  budgetParams: BudgetParameters;
  flights: Flight[];
  scholarship: ScholarshipConfig;
} => {
  const [cityId, stayDuration, budgetParams, flights, scholarship] = encoded.split('~');
  return {
    cityId,
    stayDuration: parseInt(stayDuration, 36),
    budgetParams: decodeBudgetParams(budgetParams),
    flights: decodeFlights(flights),
    scholarship: decodeScholarship(scholarship)
  };
}; 