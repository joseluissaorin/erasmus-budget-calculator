// components/FlightsManager.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Plus, Trash2, Plane } from 'lucide-react';
import { Flight } from '../types';

interface FlightsManagerProps {
  flights: Flight[];
  onChange: (flights: Flight[]) => void;
  preferredCurrency: string;
}

export function FlightsManager({
  flights,
  onChange,
  preferredCurrency
}: FlightsManagerProps) {
  const addFlight = () => {
    const newFlight: Flight = {
      id: Date.now().toString(),
      description: '',
      price: 0,
      date: new Date().toISOString().split('T')[0],
      isShared: true
    };
    onChange([...flights, newFlight]);
  };

  const removeFlight = (id: string) => {
    onChange(flights.filter(flight => flight.id !== id));
  };

  const updateFlight = (id: string, field: keyof Flight, value: string | number | boolean) => {
    onChange(flights.map(flight => 
      flight.id === id ? { ...flight, [field]: value } : flight
    ));
  };

  const totalCost = flights.reduce((sum, flight) => sum + flight.price, 0);
  const totalPerPerson = flights.reduce((sum, flight) => {
    return sum + (flight.isShared ? flight.price / 2 : flight.price);
  }, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Flight Management</CardTitle>
        <Button 
          onClick={addFlight} 
          variant="outline" 
          size="sm"
          className="text-purple-600 hover:text-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Flight
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {flights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Plane className="w-12 h-12 mx-auto mb-3 text-purple-300" />
            <p>No flights added yet. Add your first flight!</p>
          </div>
        ) : (
          <>
            {flights.map((flight) => (
              <div 
                key={flight.id} 
                className="p-4 bg-purple-50 rounded-lg space-y-4 relative group"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                  onClick={() => removeFlight(flight.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={flight.description}
                      onChange={(e) => updateFlight(flight.id, 'description', e.target.value)}
                      placeholder="e.g., Outbound Flight"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Price ({preferredCurrency})</Label>
                    <Input
                      type="number"
                      value={flight.price}
                      onChange={(e) => updateFlight(flight.id, 'price', Number(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={flight.date}
                      onChange={(e) => updateFlight(flight.id, 'date', e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2 self-end">
                    <Switch
                      checked={flight.isShared}
                      onCheckedChange={(checked) => updateFlight(flight.id, 'isShared', checked)}
                    />
                    <Label>Split cost</Label>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 bg-purple-100 rounded-lg space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Total Flight Costs:</span>
                <span>{totalCost.toFixed(2)} {preferredCurrency}</span>
              </div>
              <div className="flex justify-between items-center font-semibold">
                <span>Cost Per Person:</span>
                <span>{totalPerPerson.toFixed(2)} {preferredCurrency}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Split costs are divided equally between two people
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}