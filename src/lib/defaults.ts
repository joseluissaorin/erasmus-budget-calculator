import { BudgetParameters, ExpenseParameter, AccommodationParameter } from '@/types';

const DEFAULT_EXPENSE: ExpenseParameter = {
  amount: 0,
  isShared: false,
};

const DEFAULT_ACCOMMODATION: AccommodationParameter = {
  amount: 0,
  isShared: false,
  deposit: 0,
  numberOfPeople: 1,
};

export function createDefaultBudgetParameters(): BudgetParameters {
  return {
    accommodation: DEFAULT_ACCOMMODATION,
    utilities: { ...DEFAULT_EXPENSE },
    groceries: { ...DEFAULT_EXPENSE },
    transport: { ...DEFAULT_EXPENSE },
    entertainment: { ...DEFAULT_EXPENSE },
    dining: { ...DEFAULT_EXPENSE },
    leisure: { ...DEFAULT_EXPENSE },
    other: { ...DEFAULT_EXPENSE },
  };
} 