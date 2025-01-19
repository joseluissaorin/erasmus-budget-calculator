// components/BudgetConfig.tsx
"use client"

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { BudgetParameters, City, ExpenseParameter, CostItem } from '../types';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { createDefaultBudgetParameters } from '@/lib/defaults';
import { ErrorBoundary } from './error-boundary';
import { isValidBudgetParameters, validateBudgetParameters } from '@/lib/validation';
import { EXPENSE_COLORS, EXPENSE_BACKGROUNDS, EXPENSE_TEXT_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface BudgetConfigProps {
  params: BudgetParameters;
  onChange: (params: BudgetParameters) => void;
  cityData: City | null;
  preferredCurrency: string;
}

const SLIDER_RANGES = {
  accommodation: { min: 0, max: 2000, step: 50 },
  utilities: { min: 0, max: 200, step: 10 },
  groceries: { min: 0, max: 400, step: 20 },
  transport: { min: 0, max: 150, step: 10 },
  entertainment: { min: 0, max: 250, step: 10 },
  dining: { min: 0, max: 600, step: 20 },
  leisure: { min: 0, max: 300, step: 10 },
  other: { min: 0, max: 500, step: 10 }
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function BudgetConfig({ 
  params: initialParams, 
  onChange, 
  cityData,
  preferredCurrency
}: BudgetConfigProps) {
  const [params, setParams] = useState<BudgetParameters>(() => ({
    ...createDefaultBudgetParameters(),
    ...initialParams,
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { savePreference, getPreference } = useIndexedDB();

  const loadPreferences = useCallback(async (retryAttempt = 0) => {
    if (!cityData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const savedParams = await getPreference<BudgetParameters>(`budget_${cityData.id}`);
      if (savedParams && isValidBudgetParameters(savedParams)) {
        setParams(savedParams);
        onChange(savedParams);
      } else {
        const defaults = createDefaultBudgetParameters();
        setParams(defaults);
        onChange(defaults);
      }
    } catch (error) {
      console.error('Failed to load budget preferences:', error);
      if (retryAttempt < MAX_RETRIES) {
        setTimeout(() => {
          loadPreferences(retryAttempt + 1);
        }, RETRY_DELAY);
      } else {
        setError('Failed to load preferences. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [cityData, onChange, getPreference]);

  const savePreferences = useCallback(async (newParams: BudgetParameters, retryAttempt = 0) => {
    if (!cityData) return;

    const validationErrors = validateBudgetParameters(newParams);
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await savePreference(`budget_${cityData.id}`, newParams);
      setRetryCount(0);
    } catch (error) {
      console.error('Failed to save budget preferences:', error);
      if (retryAttempt < MAX_RETRIES) {
        setTimeout(() => {
          savePreferences(newParams, retryAttempt + 1);
        }, RETRY_DELAY);
        setRetryCount(retryAttempt + 1);
      } else {
        setError('Failed to save preferences. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [cityData, savePreference]);

  useEffect(() => {
    loadPreferences();
  }, [cityData, loadPreferences]);

  const handleParamChange = (
    category: keyof BudgetParameters,
    field: keyof ExpenseParameter | 'deposit' | 'numberOfPeople',
    value: number | boolean
  ) => {
    const updatedParams = { ...params };
    if (field === 'deposit' || field === 'numberOfPeople') {
      if (category === 'accommodation') {
        (updatedParams[category] as any)[field] = value;
      }
    } else {
      (updatedParams[category] as any)[field] = value;
    }
    setParams(updatedParams);
    onChange(updatedParams);
    savePreferences(updatedParams);
  };

  const renderExpenseControl = (
    category: keyof BudgetParameters,
    title: string,
    suggestedAmount: number | undefined,
    canBeShared: boolean = true
  ) => {
    const param = params[category] as ExpenseParameter;
    const range = SLIDER_RANGES[category];
    const bgColor = EXPENSE_BACKGROUNDS[category];
    const textColor = EXPENSE_TEXT_COLORS[category];
    const color = EXPENSE_COLORS[category];

    return (
      <div className={cn("space-y-4 p-4 rounded-lg transition-colors", bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <Label className={cn("text-lg font-semibold", textColor)}>{title}</Label>
          </div>
          <div className="flex items-center space-x-2">
            {canBeShared && (
              <>
                <Switch
                  checked={param.isShared}
                  onCheckedChange={(checked) =>
                    handleParamChange(category, 'isShared', checked)
                  }
                />
                <Label>Shared</Label>
              </>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Amount ({preferredCurrency})</span>
            <Input
              type="number"
              value={param.amount}
              onChange={(e) =>
                handleParamChange(category, 'amount', Number(e.target.value))
              }
              className="w-24 text-right"
            />
          </div>

          <Slider
            value={[param.amount]}
            min={range.min}
            max={suggestedAmount ? Math.max(range.max, suggestedAmount * 2) : range.max}
            step={range.step}
            onValueChange={([value]) =>
              handleParamChange(category, 'amount', value)
            }
            className="[&>[role=slider]]:border-current [&>[role=slider]]:bg-current"
            style={{ color }}
          />

          {suggestedAmount && (
            <div className="text-sm text-gray-500">
              Suggested amount: {suggestedAmount} {preferredCurrency}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!cityData) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>Budget Configuration</CardTitle>
          {loading && (
            <div className="text-sm text-gray-500">
              <ReloadIcon className="inline-block animate-spin mr-2" />
              {retryCount > 0 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : 'Loading...'}
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => loadPreferences()}
              >
                Try Again
              </Button>
            </Alert>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Accommodation Section */}
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
            <Label className="text-lg font-semibold text-purple-800">Accommodation</Label>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Monthly Rent ({preferredCurrency})</Label>
                <Input
                  type="number"
                  value={params.accommodation.amount}
                  onChange={(e) =>
                    handleParamChange('accommodation', 'amount', Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Deposit (months)</Label>
                <Input
                  type="number"
                  value={params.accommodation.deposit}
                  onChange={(e) =>
                    handleParamChange('accommodation', 'deposit', Number(e.target.value))
                  }
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={params.accommodation.isShared}
                  onCheckedChange={(checked) =>
                    handleParamChange('accommodation', 'isShared', checked)
                  }
                />
                <Label>Shared Accommodation</Label>
              </div>
              {params.accommodation.isShared && (
                <div className="space-y-2">
                  <Label>Number of People</Label>
                  <Input
                    type="number"
                    min={2}
                    value={params.accommodation.numberOfPeople}
                    onChange={(e) =>
                      handleParamChange('accommodation', 'numberOfPeople', Number(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Monthly Expenses */}
          {renderExpenseControl('utilities', 'Utilities', undefined)}
          {renderExpenseControl('groceries', 'Groceries', undefined)}
          {renderExpenseControl('transport', 'Transport', undefined, false)}
          {renderExpenseControl('entertainment', 'Entertainment', undefined, false)}
          {renderExpenseControl('dining', 'Dining', undefined)}
          {renderExpenseControl('leisure', 'Leisure', undefined, false)}
          {renderExpenseControl('other', 'Other Expenses', undefined, false)}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
}