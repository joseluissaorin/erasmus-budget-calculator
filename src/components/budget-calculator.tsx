// components/BudgetCalculator.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { City, BudgetParameters, ScholarshipConfig, Flight, ExchangeRate } from '../types/index';
import { useExchangeRates } from '../hooks/useExchangeRates';
import { CitySelector } from './city-selector';
import { BudgetConfig } from './budget-config';
import { FlightsManager } from './flights-manager';
import { ScholarshipConfig as ScholarshipConfigComponent } from './scholarship-config';
import { ExpensesSummary } from './expenses-summary';
import { ShareButton } from './share-button';
import { cn } from '@/lib/utils';
import { decodeState } from '@/utils/url-state';
import { getCityById } from '@/utils/city-utils';

const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#FF66B2', '#9933FF', '#00B3E6'];

const defaultBudgetParams: BudgetParameters = {
  accommodation: { amount: 0, deposit: 0, isShared: true, numberOfPeople: 2 },
  utilities: { amount: 0, isShared: true },
  groceries: { amount: 0, isShared: true },
  transport: { amount: 0, isShared: false },
  entertainment: { amount: 0, isShared: false },
  dining: { amount: 0, isShared: true },
  leisure: { amount: 0, isShared: false },
  other: { amount: 0, isShared: false }
};

export default function BudgetCalculator() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [budgetParams, setBudgetParams] = useState<BudgetParameters>(defaultBudgetParams);
  const [scholarship, setScholarship] = useState<ScholarshipConfig>({
    monthlyGrant: 0,
    maxMonths: 0,
    travelSupport: 0
  });
  const [flights, setFlights] = useState<Flight[]>([]);
  const [stayDuration, setStayDuration] = useState(6);
  const [isLoading, setIsLoading] = useState(true);

  const { rates, loading: ratesLoading } = useExchangeRates();

  // Load shared state from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedState = params.get('s');
    
    if (sharedState) {
      try {
        const decoded = decodeState(sharedState);
        // Find the city by ID
        // Note: You'll need to implement this function to get the city by ID
        const city = getCityById(decoded.cityId);
        if (city) {
          setSelectedCity(city);
          setBudgetParams(decoded.budgetParams);
          setFlights(decoded.flights);
          setScholarship(decoded.scholarship);
          setStayDuration(decoded.stayDuration);
        }
      } catch (err) {
        console.error('Failed to load shared state:', err);
      }
    }
    setIsLoading(false);
  }, []);

  // Calculate totals and update them when any dependency changes
  useEffect(() => {
    if (selectedCity && rates && !ratesLoading) {
      calculateTotals();
    }
  }, [selectedCity, budgetParams, scholarship, flights, rates, stayDuration]);

  const calculateTotals = () => {
    // Implementation of total calculations
  };

  const renderSection = (number: number, title: string, description: string, children: React.ReactNode) => (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-900 font-semibold">
              {number}
            </div>
            <CardTitle className="text-2xl text-purple-900">{title}</CardTitle>
          </div>
          {number === 5 && (
            <ShareButton
              city={selectedCity}
              stayDuration={stayDuration}
              budgetParams={budgetParams}
              flights={flights}
              scholarship={scholarship}
            />
          )}
        </div>
        <CardDescription className="text-gray-500">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(
        "p-6 transition-all duration-200",
        selectedCity || number === 1 ? "opacity-100" : "opacity-50"
      )}>
        {children}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <CardHeader className="text-center py-12 relative z-10">
            <CardTitle className="text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-white animate-gradient-x">
              Erasmus Budget Calculator
            </CardTitle>
            <CardDescription className="text-purple-100 text-lg mt-4 font-medium">
              Plan your Erasmus adventure with confidence
            </CardDescription>
          </CardHeader>
        </Card>

        {renderSection(1, "Select Your Destination", "Choose the city where you'll be studying", 
          <CitySelector
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            loading={ratesLoading}
          />
        )}

        {renderSection(2, "Configure Your Budget", "Set up your monthly expenses and accommodation details",
          <BudgetConfig
            params={budgetParams}
            onChange={setBudgetParams}
            cityData={selectedCity}
            preferredCurrency={selectedCity?.currency ?? 'EUR'}
          />
        )}

        {renderSection(3, "Manage Flights", "Add your travel arrangements and costs",
          <FlightsManager
            flights={flights}
            onChange={setFlights}
            preferredCurrency={selectedCity?.currency ?? 'EUR'}
          />
        )}

        {renderSection(4, "Scholarship Details", "Configure your Erasmus+ grant and other funding",
          <ScholarshipConfigComponent
            config={scholarship}
            onChange={setScholarship}
            duration={stayDuration}
            onDurationChange={setStayDuration}
            preferredCurrency={selectedCity?.currency ?? 'EUR'}
          />
        )}

        {renderSection(5, "Expenses Summary", "Review your total budget and monthly breakdown",
          <ExpensesSummary
            budgetParams={budgetParams}
            flights={flights}
            scholarship={scholarship}
            duration={stayDuration}
            rates={rates}
            cityData={selectedCity}
            costs={null}
            preferredCurrency={selectedCity?.currency ?? 'EUR'}
          />
        )}

        <footer className="text-center py-8 text-gray-600">
          <p className="flex items-center justify-center gap-1">
            made with <span className="text-red-500">❤️</span> by saorin
          </p>
          <p className="text-sm mt-1">© 2025</p>
        </footer>
      </div>
    </div>
  );
}