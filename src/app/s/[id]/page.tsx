'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUrlById } from '@/lib/url-store';

// This page will handle redirection from short URLs to the full state URL
export default function ShortUrlRedirect({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    async function redirect() {
      try {
        // Fetch the original state from the server
        const res = await fetch(`/api/shorturl/${id}`);
        
        if (!res.ok) {
          // Handle errors
          console.error('Failed to retrieve original URL state');
          router.push('/');
          return;
        }
        
        const data = await res.json();
        
        if (data.state) {
          // Redirect to the main budget page with the state parameter
          router.push(`/budget?s=${data.state}`);
        } else {
          // If no state is returned, redirect to the home page
          router.push('/');
        }
      } catch (error) {
        console.error('Error redirecting from short URL:', error);
        router.push('/');
      }
    }
    
    redirect();
  }, [id, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting...</h1>
        <p className="text-gray-500">Please wait while we redirect you.</p>
      </div>
    </div>
  );
} 