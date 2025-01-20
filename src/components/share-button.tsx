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

  const handleShare = async () => {
    try {
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

      // Create the shareable URL
      const url = new URL(window.location.href);
      url.searchParams.set('s', encoded);
      const shareableUrl = url.toString();

      // Copy to clipboard
      await navigator.clipboard.writeText(shareableUrl);
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
        disabled={!city}
      >
        <div className="flex items-center space-x-2">
          {copied ? (
            <CheckIcon className="w-4 h-4 text-green-600" />
          ) : (
            <Share1Icon className="w-4 h-4" />
          )}
          <span>{copied ? 'Copied!' : 'Share'}</span>
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