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
  const [shortUrl, setShortUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
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
      setShortUrl(shortUrl);
      setError(null);

    } catch (err) {
      console.error('Failed to generate sharing link:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate sharing link');
      
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
          setShortUrl(url.toString());
          
          setError('Short URL service unavailable - using full URL instead');
        }
      } catch (fallbackErr) {
        console.error('Fallback sharing also failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortUrl) return;
    
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setError('Could not copy to clipboard. Please copy the URL manually.');
    }
  };

  return (
    <div className="space-y-2">
      {!shortUrl ? (
        <Button
          className="hover:bg-purple-50"
          onClick={handleGenerate}
          disabled={!city || isLoading}
        >
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Share1Icon className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Generating...' : 'Generate Share Link'}</span>
          </div>
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Button
              className={cn(
                "flex-1 transition-all duration-200",
                copied ? "bg-green-50 text-green-700" : "hover:bg-purple-50 text-black"
              )}
              onClick={handleCopy}
            >
              <div className="flex items-center space-x-2">
                {copied ? (
                  <CheckIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <CopyIcon className="w-4 h-4" />
                )}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </div>
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={() => setShortUrl(null)}
            className="w-full"
          >
            Share Again!
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 