import { NextRequest, NextResponse } from 'next/server';
import { storeUrl } from '@/lib/url-store';

// List of allowed domains
const ALLOWED_DOMAINS = [
  'erasmus.joseluissaorin.com',
  'erasmusbudget.com',
  'www.erasmus.joseluissaorin.com',
  'www.erasmusbudget.com'
];

export async function POST(req: NextRequest) {
  try {
    // Parse the request body for the URL to shorten
    const body = await req.json();
    const { state } = body;
    
    if (!state) {
      return NextResponse.json(
        { error: 'Missing state parameter' },
        { status: 400 }
      );
    }
    
    // Store the state and get a short ID
    const id = storeUrl(state);
    
    // Get the appropriate base URL
    // First check host header
    const host = req.headers.get('host');
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // If NEXT_PUBLIC_BASE_URL isn't set, dynamically detect the domain
    if (!baseUrl) {
      if (host && ALLOWED_DOMAINS.some(domain => host.includes(domain))) {
        // If the host matches one of our allowed domains, use the protocol and host
        const protocol = req.headers.get('x-forwarded-proto') || 'https';
        baseUrl = `${protocol}://${host}`;
      } else {
        // Fallback to origin (which might be localhost during development)
        baseUrl = req.nextUrl.origin;
      }
    }
    
    // Create the short URL
    const shortUrl = `${baseUrl}/s/${id}`;
    
    // Return the short URL
    return NextResponse.json({ shortUrl, id });
    
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: 'Failed to create short URL' },
      { status: 500 }
    );
  }
} 