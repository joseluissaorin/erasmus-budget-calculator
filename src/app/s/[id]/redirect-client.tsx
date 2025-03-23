'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Client component to handle redirection
export default function RedirectClient({ 
  id, 
  state 
}: { 
  id: string; 
  state: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    if (state) {
      // Redirect to the main budget page with the state parameter
      router.push(`/budget?s=${state}`);
    } else {
      // If no state is returned, redirect to the home page
      console.error('Short URL not found:', id);
      router.push('/');
    }
  }, [id, state, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-500">Please wait while we redirect you.</p>
      </div>
    </div>
  );
} 