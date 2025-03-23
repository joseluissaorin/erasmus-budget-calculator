'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Share1Icon, CheckIcon, CopyIcon } from '@radix-ui/react-icons';
import { City, BudgetParameters, ScholarshipConfig, Flight } from '@/types';
import { encodeState } from '@/utils/url-state';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  city: City | null;
  stayDuration: number;
  budgetParams: BudgetParameters;
  flights: Flight[];
  scholarship: ScholarshipConfig;
}

export function ShareButton({
  city,
  stayDuration,
  budgetParams,
  flights,
  scholarship
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async () => {
    try {
      setIsLoading(true);
      
      if (!city) {
        throw new Error('Please select a city before sharing');
      }

      // Create the shared state object
      const state = {
        cityId: city.id,
        budgetParams,
        flights,
        scholarship,
        stayDuration
      };

      // Encode the state
      const encoded = encodeState(state);

      // Create the short URL instead of using the full encoded state
      const response = await fetch('/api/shorturl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: encoded }),
      });

      if (!response.ok) {
        throw new Error('Failed to create short URL');
      }

      const { shortUrl } = await response.json();

      // Copy to clipboard
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setError(null);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (err) {
      console.error('Failed to share budget:', err);
      setError(err instanceof Error ? err.message : 'Failed to share budget configuration');
      setCopied(false);
      
      // Fallback to the original direct URL sharing method if shortening fails
      try {
        if (city) {
          const state = {
            cityId: city.id,
            budgetParams,
            flights,
            scholarship,
            stayDuration
          };
          
          const encoded = encodeState(state);
          const url = new URL(window.location.href);
          url.searchParams.set('s', encoded);
          await navigator.clipboard.writeText(url.toString());
          
          setCopied(true);
          setError('Short URL service unavailable - using full URL instead');
          
          setTimeout(() => {
            setCopied(false);
            setError(null);
          }, 2000);
        }
      } catch (fallbackErr) {
        console.error('Fallback sharing also failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        className={cn(
          "transition-all duration-200",
          copied ? "bg-green-50 text-green-700" : "hover:bg-purple-50"
        )}
        onClick={handleShare}
        disabled={!city || isLoading}
      >
        <div className="flex items-center space-x-2">
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : copied ? (
            <CheckIcon className="w-4 h-4 text-green-600" />
          ) : (
            <Share1Icon className="w-4 h-4" />
          )}
          <span>{isLoading ? 'Generating...' : copied ? 'Copied!' : 'Share'}</span>
        </div>
      </Button>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 