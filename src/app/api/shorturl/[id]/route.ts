import { NextRequest, NextResponse } from 'next/server';
import { getUrlById } from '@/lib/url-store';

// Simple approach: extracting id from path
export async function GET(req: NextRequest) {
  try {
    // Extract the id from the URL path
    const path = req.nextUrl.pathname;
    const id = path.split('/').pop() || '';
    
    if (!id) {
      return NextResponse.json(
        { error: 'Missing ID parameter' },
        { status: 400 }
      );
    }
    
    // Get the original state from the database
    const state = getUrlById(id);
    
    if (state) {
      // Return the original state
      return NextResponse.json({ state });
    } else {
      // Handle not found
      return NextResponse.json(
        { error: 'Short URL not found' },
        { status: 404 }
      );
    }
    
  } catch (error) {
    console.error('Error retrieving short URL:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve short URL' },
      { status: 500 }
    );
  }
} 