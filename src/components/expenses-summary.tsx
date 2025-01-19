// components/ExpensesSummary.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BudgetParameters, City, CityResponse, Flight, ScholarshipConfig, ExchangeRate } from '../types';

interface ExpensesSummaryProps {
  budgetParams: BudgetParameters;
  flights: Flight[];
  scholarship: ScholarshipConfig;
  duration: number;
  rates: ExchangeRate | null;
  cityData: City | null;
  costs: CityResponse | null;
  preferredCurrency: string;
}

export function ExpensesSummary({
  budgetParams,
  flights,
  scholarship,
  duration,
  rates,
  cityData,
  costs,
  preferredCurrency
}: ExpensesSummaryProps) {
  const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#FF66B2', '#9933FF', '#00B3E6', '#82ca9d'];

  // Calculate costs per category
  const calculateExpenses = () => {
    // Monthly expenses
    const monthlyExpenses = {
      accommodation: budgetParams.accommodation.isShared
        ? budgetParams.accommodation.amount / budgetParams.accommodation.numberOfPeople
        : budgetParams.accommodation.amount,
      utilities: budgetParams.utilities.isShared
        ? budgetParams.utilities.amount / 2
        : budgetParams.utilities.amount,
      groceries: budgetParams.groceries.isShared
        ? budgetParams.groceries.amount / 2
        : budgetParams.groceries.amount,
      transport: budgetParams.transport.amount,
      entertainment: budgetParams.entertainment.amount,
      dining: budgetParams.dining.isShared
        ? budgetParams.dining.amount / 2
        : budgetParams.dining.amount,
    };

    // Calculate actual deposit amount (months * monthly rent)
    const depositAmount = budgetParams.accommodation.deposit * budgetParams.accommodation.amount;

    // One-time expenses
    const oneTimeExpenses = {
      deposit: budgetParams.accommodation.isShared
        ? depositAmount / budgetParams.accommodation.numberOfPeople
        : depositAmount,
      flightCosts: flights.reduce((total, flight) => {
        return total + (flight.isShared ? flight.price / 2 : flight.price);
      }, 0)
    };

    // Scholarship calculations
    const scholarshipCoverage = {
      monthlySupport: scholarship.monthlyGrant * Math.min(duration, scholarship.maxMonths),
      travelSupport: scholarship.travelSupport,
      additionalSupport: scholarship.additionalSupport || 0
    };

    return { monthlyExpenses, oneTimeExpenses, scholarshipCoverage };
  };

  const { monthlyExpenses, oneTimeExpenses, scholarshipCoverage } = calculateExpenses();

  // Calculate totals
  const totalMonthlyExpenses = Object.values(monthlyExpenses).reduce((a, b) => a + b, 0);
  const totalForDuration = totalMonthlyExpenses * duration;
  const totalOneTime = oneTimeExpenses.deposit + oneTimeExpenses.flightCosts;
  const totalScholarship = Object.values(scholarshipCoverage).reduce((a, b) => a + b, 0);

  const totalCost = totalForDuration + totalOneTime;
  const netCost = totalCost - totalScholarship;
  const netCostAfterDeposit = netCost - oneTimeExpenses.deposit;

  // Prepare data for pie chart
  const expensesData = [
    ...Object.entries(monthlyExpenses).map(([key, value]) => ({
      name: key,
      value: value * duration
    })),
    { name: 'Deposit', value: oneTimeExpenses.deposit },
    { name: 'Flights', value: oneTimeExpenses.flightCosts }
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {Object.entries(monthlyExpenses).map(([category, amount], index) => (
                <div 
                  key={category}
                  className="flex justify-between items-center p-3 bg-purple-50 rounded-lg"
                >
                  <span className="capitalize flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    {category}
                  </span>
                  <span className="font-medium">
                    {amount.toFixed(2)} {preferredCurrency}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center p-3 bg-purple-100 rounded-lg font-semibold">
                <span>Total Monthly</span>
                <span>{totalMonthlyExpenses.toFixed(2)} {preferredCurrency}</span>
              </div>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${Number(value).toFixed(2)} ${preferredCurrency}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Final Cost Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-purple-800">Duration Costs</h3>
                <div className="p-3 bg-purple-50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>Monthly Expenses × {duration} months</span>
                    <span>{totalForDuration.toFixed(2)} {preferredCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>One-time Expenses</span>
                    <span>{totalOneTime.toFixed(2)} {preferredCurrency}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-medium">
                    <span>Total Cost</span>
                    <span>{totalCost.toFixed(2)} {preferredCurrency}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-green-700">Scholarship Coverage</h3>
                <div className="p-3 bg-green-50 rounded-lg space-y-2">
                  {Object.entries(scholarshipCoverage).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span>{value.toFixed(2)} {preferredCurrency}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t font-medium">
                    <span>Total Support</span>
                    <span>{totalScholarship.toFixed(2)} {preferredCurrency}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-purple-800">Net Costs</h3>
              <div className="p-4 bg-purple-100 rounded-lg space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Expenses</span>
                    <span>{totalCost.toFixed(2)} {preferredCurrency}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Scholarship Coverage</span>
                    <span>-{totalScholarship.toFixed(2)} {preferredCurrency}</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between font-semibold">
                    <span>Net Cost (with deposit)</span>
                    <span>{netCost.toFixed(2)} {preferredCurrency}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-purple-700">
                    <span>Net Cost (after deposit refund)</span>
                    <span>{netCostAfterDeposit.toFixed(2)} {preferredCurrency}</span>
                  </div>
                  <div className="flex justify-between text-sm text-purple-600">
                    <span>Monthly Average Cost</span>
                    <span>{(netCostAfterDeposit / duration).toFixed(2)} {preferredCurrency}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}