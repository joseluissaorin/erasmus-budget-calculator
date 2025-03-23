import { getUrlById } from '@/lib/url-store';
import RedirectClient from './redirect-client';

// Server component that properly handles the params Promise
export default async function ShortUrlRedirect({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  // Server-side fetch of the URL data
  const state = getUrlById(id);
  
  // Pass the state to the client component that will handle the redirection
  return <RedirectClient id={id} state={state} />;
} 