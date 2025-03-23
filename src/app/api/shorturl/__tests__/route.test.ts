import { NextRequest } from 'next/server';
import { POST } from '../route';
import { saveUrl } from '@/lib/url-store';

// Mock dependencies
jest.mock('@/lib/url-store', () => ({
  saveUrl: jest.fn(),
}));

describe('POST /api/shorturl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a short URL when given valid state data', async () => {
    // Mock saveUrl to return a shortId
    const mockShortId = 'abc123';
    (saveUrl as jest.Mock).mockResolvedValue(mockShortId);

    // Create mock request with body
    const req = new NextRequest('http://localhost/api/shorturl', {
      method: 'POST',
      body: JSON.stringify({ state: 'test-state-data' }),
    });

    // Call the handler
    const response = await POST(req);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('shortId', mockShortId);
    expect(data).toHaveProperty('shortUrl');
    expect(data.shortUrl).toContain(mockShortId);

    // Check that saveUrl was called with the correct state
    expect(saveUrl).toHaveBeenCalledWith('test-state-data');
  });

  it('should return 400 if state is missing from request', async () => {
    // Create mock request with empty body
    const req = new NextRequest('http://localhost/api/shorturl', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    // Call the handler
    const response = await POST(req);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error', 'Missing state parameter');

    // Check that saveUrl was not called
    expect(saveUrl).not.toHaveBeenCalled();
  });

  it('should return 500 if an error occurs during URL creation', async () => {
    // Mock saveUrl to throw an error
    (saveUrl as jest.Mock).mockRejectedValue(new Error('Test error'));

    // Create mock request with body
    const req = new NextRequest('http://localhost/api/shorturl', {
      method: 'POST',
      body: JSON.stringify({ state: 'test-state-data' }),
    });

    // Call the handler
    const response = await POST(req);
    const data = await response.json();

    // Check response
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error', 'Failed to create short URL');

    // Check that saveUrl was called
    expect(saveUrl).toHaveBeenCalledWith('test-state-data');
  });
}); 