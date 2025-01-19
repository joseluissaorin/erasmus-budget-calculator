import { BudgetParameters, ExpenseParameter, AccommodationParameter } from '@/types';

export function isValidExpenseParameter(param: any): param is ExpenseParameter {
  return (
    param !== null &&
    typeof param === 'object' &&
    typeof param.amount === 'number' &&
    typeof param.isShared === 'boolean'
  );
}

export function isValidAccommodationParameter(param: any): param is AccommodationParameter {
  return (
    param !== null &&
    typeof param === 'object' &&
    typeof param.amount === 'number' &&
    typeof param.isShared === 'boolean' &&
    typeof param.deposit === 'number' &&
    typeof param.numberOfPeople === 'number' &&
    param.numberOfPeople >= 1
  );
}

export function isValidBudgetParameters(params: any): params is BudgetParameters {
  if (!params || typeof params !== 'object') return false;

  const requiredKeys = [
    'accommodation',
    'utilities',
    'groceries',
    'transport',
    'entertainment',
    'dining',
    'leisure',
    'other'
  ];

  return (
    requiredKeys.every(key => key in params) &&
    isValidAccommodationParameter(params.accommodation) &&
    isValidExpenseParameter(params.utilities) &&
    isValidExpenseParameter(params.groceries) &&
    isValidExpenseParameter(params.transport) &&
    isValidExpenseParameter(params.entertainment) &&
    isValidExpenseParameter(params.dining) &&
    isValidExpenseParameter(params.leisure) &&
    isValidExpenseParameter(params.other)
  );
}

export function validateBudgetParameters(params: any): string[] {
  const errors: string[] = [];

  if (!params || typeof params !== 'object') {
    errors.push('Invalid budget parameters format');
    return errors;
  }

  const validateExpense = (key: string, param: any, isAccommodation = false) => {
    if (!param || typeof param !== 'object') {
      errors.push(`Invalid ${key} parameter format`);
      return;
    }

    if (typeof param.amount !== 'number') {
      errors.push(`Invalid ${key} amount`);
    }
    if (typeof param.isShared !== 'boolean') {
      errors.push(`Invalid ${key} isShared value`);
    }

    if (isAccommodation) {
      if (typeof param.deposit !== 'number') {
        errors.push('Invalid accommodation deposit');
      }
      if (typeof param.numberOfPeople !== 'number' || param.numberOfPeople < 1) {
        errors.push('Invalid number of people for accommodation');
      }
    }
  };

  validateExpense('accommodation', params.accommodation, true);
  validateExpense('utilities', params.utilities);
  validateExpense('groceries', params.groceries);
  validateExpense('transport', params.transport);
  validateExpense('entertainment', params.entertainment);
  validateExpense('dining', params.dining);
  validateExpense('leisure', params.leisure);
  validateExpense('other', params.other);

  return errors;
} 