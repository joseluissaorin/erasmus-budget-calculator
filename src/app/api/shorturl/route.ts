import { NextRequest, NextResponse } from 'next/server';
import { storeUrl } from '@/lib/url-store';

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
    
    // Create the short URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;
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