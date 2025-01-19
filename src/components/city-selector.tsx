// components/CitySelector.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, getCountryFlag } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { City, NormalizedCity } from '@/types';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import citiesData from '@/data/cities.json';

interface CitySelectorProps {
  selectedCity: City | null;
  onSelectCity: (city: City | null) => void;
  loading: boolean;
}

function createCityFromNormalized(normalizedCity: NormalizedCity): City {
  return {
    id: normalizedCity.id,
    name: normalizedCity.city,
    country: normalizedCity.country,
    currency: 'EUR',
    latitude: 0,
    longitude: 0
  };
}

export function CitySelector({ selectedCity, onSelectCity, loading: externalLoading }: CitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentCities, setRecentCities] = useState<City[]>([]);
  const { savePreference, getPreference } = useIndexedDB();

  useEffect(() => {
    const loadRecentCities = async () => {
      const saved = await getPreference<City[]>('recentCities');
      if (saved) {
        setRecentCities(saved);
      }
    };
    loadRecentCities();
  }, []);

  const handleSelect = async (city: City) => {
    onSelectCity(city);
    setOpen(false);

    const updatedRecent = [
      city,
      ...recentCities.filter(c => c.id !== city.id)
    ].slice(0, 5);

    setRecentCities(updatedRecent);
    await savePreference('recentCities', updatedRecent);
  };

  const filteredCities = citiesData
    .filter(city => 
      city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.country.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select your destination</CardTitle>
      </CardHeader>
      <CardContent>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
              disabled={externalLoading}
            >
              {selectedCity ? (
                <>
                  {getCountryFlag(selectedCity.country)} {selectedCity.name}, {selectedCity.country}
                </>
              ) : (
                "Select a city..."
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput 
                placeholder="Search cities..." 
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>No cities found.</CommandEmpty>
                {recentCities.length > 0 && (
                  <CommandGroup heading="Recent">
                    {recentCities.map((city) => (
                      <CommandItem
                        key={city.id}
                        value={city.id}
                        onSelect={() => handleSelect(city)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCity?.id === city.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {getCountryFlag(city.country)} {city.name}, {city.country}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                <CommandGroup heading="All cities">
                  {filteredCities.map((city) => {
                    const normalizedCity = createCityFromNormalized(city);
                    return (
                      <CommandItem
                        key={normalizedCity.id}
                        value={normalizedCity.id}
                        onSelect={() => handleSelect(normalizedCity)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCity?.id === normalizedCity.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {getCountryFlag(normalizedCity.country)} {normalizedCity.name}, {normalizedCity.country}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
}