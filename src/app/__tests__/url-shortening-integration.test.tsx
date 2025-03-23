import { NextRequest } from 'next/server';
import { POST } from '../api/shorturl/route';
import { GET } from '../api/shorturl/[id]/route';
import { storeUrl, getUrlById } from '@/lib/url-store';

// Mock the url-store module
jest.mock('@/lib/url-store', () => ({
  storeUrl: jest.fn(),
  getUrlById: jest.fn(),
}));

describe('URL Shortening Integration', () => {
  const originalState = 'long-encoded-state-data';
  const mockId = 'abc123';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock storeUrl to return our mockId
    (storeUrl as jest.Mock).mockReturnValue(mockId);
    
    // Mock getUrlById to return our original state
    (getUrlById as jest.Mock).mockReturnValue(originalState);
  });
  
  it('successfully creates and retrieves a shortened URL', async () => {
    // Step 1: Test storing a URL
    const storeReq = new NextRequest('http://localhost/api/shorturl', {
      method: 'POST',
      body: JSON.stringify({ state: originalState }),
    });
    
    // Call the POST handler
    const storeResponse = await POST(storeReq);
    const storeData = await storeResponse.json();
    
    // Verify store response
    expect(storeResponse.status).toBe(200);
    expect(storeData).toHaveProperty('shortUrl');
    expect(storeData).toHaveProperty('id', mockId);
    expect(storeUrl).toHaveBeenCalledWith(originalState);
    
    // Step 2: Test retrieving the URL
    const retrieveReq = new NextRequest(`http://localhost/api/shorturl/${mockId}`);
    const params = { id: mockId };
    
    // Call the GET handler
    const retrieveResponse = await GET(retrieveReq, { params });
    const retrieveData = await retrieveResponse.json();
    
    // Verify retrieve response
    expect(retrieveResponse.status).toBe(200);
    expect(retrieveData).toHaveProperty('state', originalState);
    expect(getUrlById).toHaveBeenCalledWith(mockId);
  });
  
  it('handles the case when the URL is not found', async () => {
    // Mock getUrlById to return null for this test
    (getUrlById as jest.Mock).mockReturnValue(null);
    
    const retrieveReq = new NextRequest('http://localhost/api/shorturl/nonexistent');
    const params = { id: 'nonexistent' };
    
    // Call the GET handler
    const retrieveResponse = await GET(retrieveReq, { params });
    const retrieveData = await retrieveResponse.json();
    
    // Verify retrieve response
    expect(retrieveResponse.status).toBe(404);
    expect(retrieveData).toHaveProperty('error', 'Short URL not found');
  });
  
  it('handles edge cases in the URL shortening flow', async () => {
    // Test very long state data
    const longState = 'a'.repeat(10000); // Very long state
    
    const storeReq = new NextRequest('http://localhost/api/shorturl', {
      method: 'POST',
      body: JSON.stringify({ state: longState }),
    });
    
    // Call the POST handler
    const storeResponse = await POST(storeReq);
    const storeData = await storeResponse.json();
    
    // Verify store response
    expect(storeResponse.status).toBe(200);
    expect(storeData).toHaveProperty('id', mockId);
    expect(storeUrl).toHaveBeenCalledWith(longState);
    
    // Test special characters in state
    const specialCharsState = 'state with special characters: !@#$%^&*()_+{}:"<>?[];\',.';
    
    (storeUrl as jest.Mock).mockClear();
    
    const specialCharsReq = new NextRequest('http://localhost/api/shorturl', {
      method: 'POST',
      body: JSON.stringify({ state: specialCharsState }),
    });
    
    // Call the POST handler
    const specialCharsResponse = await POST(specialCharsReq);
    
    // Verify store response
    expect(storeUrl).toHaveBeenCalledWith(specialCharsState);
  });
  
  it('handles duplicate URLs properly', async () => {
    // Mock storeUrl to simulate duplicate handling behavior
    (storeUrl as jest.Mock).mockImplementation((state) => {
      // Always return the same ID for the same state
      return mockId;
    });
    
    // Store the same URL twice
    const req1 = new NextRequest('http://localhost/api/shorturl', {
      method: 'POST',
      body: JSON.stringify({ state: originalState }),
    });
    
    const req2 = new NextRequest('http://localhost/api/shorturl', {
      method: 'POST',
      body: JSON.stringify({ state: originalState }),
    });
    
    // Call the POST handler twice
    const response1 = await POST(req1);
    const data1 = await response1.json();
    
    const response2 = await POST(req2);
    const data2 = await response2.json();
    
    // Verify both responses have the same ID
    expect(data1.id).toBe(mockId);
    expect(data2.id).toBe(mockId);
    
    // Verify storeUrl was called twice
    expect(storeUrl).toHaveBeenCalledTimes(2);
  });
}); 