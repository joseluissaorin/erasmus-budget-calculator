'use client';

import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Share2, Check, Copy } from 'lucide-react';
import { encodeState } from '../utils/url-state';
import { BudgetParameters, ScholarshipConfig, Flight, City } from '../types';

interface ShareButtonProps {
  city: City | null;
  stayDuration: number;
  budgetParams: BudgetParameters;
  flights: Flight[];
  scholarship: ScholarshipConfig;
}

export function ShareButton({ city, stayDuration, budgetParams, flights, scholarship }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!city) return;

    const state = encodeState(city, stayDuration, budgetParams, flights, scholarship);
    const url = `${window.location.origin}/budget?s=${state}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <Button
      onClick={handleShare}
      disabled={!city}
      variant="outline"
      className="gap-2 bg-purple-50 hover:bg-purple-100 text-purple-900"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Share Budget
        </>
      )}
    </Button>
  );
} 