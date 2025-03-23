import { NextRequest } from 'next/server';
import { GET } from '../route';
import { getUrlById } from '@/lib/url-store';

// Mock the url-store module
jest.mock('@/lib/url-store', () => ({
  getUrlById: jest.fn(),
}));

// Define the params type to match the route implementation
type RouteParams = {
  params: {
    id: string;
  }
};

describe('GET /api/shorturl/[id]', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should return the state for an existing ID', async () => {
    // Mock implementation to return a state
    const mockState = 'encoded-state-data';
    (getUrlById as jest.Mock).mockReturnValue(mockState);
    
    // Create mock request with params
    const req = new NextRequest('http://localhost/api/shorturl/abc123');
    const params: RouteParams = { params: { id: 'abc123' } };
    
    // Call the handler
    const response = await GET(req, params);
    const data = await response.json();
    
    // Check response
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('state', mockState);
    
    // Check that getUrlById was called with the correct ID
    expect(getUrlById).toHaveBeenCalledWith('abc123');
  });
  
  it('should return 404 if ID is not found', async () => {
    // Mock implementation to return null (not found)
    (getUrlById as jest.Mock).mockReturnValue(null);
    
    // Create mock request with params
    const req = new NextRequest('http://localhost/api/shorturl/nonexistent');
    const params: RouteParams = { params: { id: 'nonexistent' } };
    
    // Call the handler
    const response = await GET(req, params);
    const data = await response.json();
    
    // Check response
    expect(response.status).toBe(404);
    expect(data).toHaveProperty('error', 'Short URL not found');
    
    // Check that getUrlById was called with the correct ID
    expect(getUrlById).toHaveBeenCalledWith('nonexistent');
  });
  
  it('should return 400 if ID is missing from params', async () => {
    // Create mock request with empty params
    const req = new NextRequest('http://localhost/api/shorturl/');
    const params: RouteParams = { params: { id: '' } };
    
    // Call the handler
    const response = await GET(req, params);
    const data = await response.json();
    
    // Check response
    expect(response.status).toBe(400);
    expect(data).toHaveProperty('error', 'Missing ID parameter');
    
    // Check that getUrlById was not called
    expect(getUrlById).not.toHaveBeenCalled();
  });
  
  it('should return 500 if an error occurs', async () => {
    // Mock getUrlById to throw an error
    (getUrlById as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });
    
    // Create mock request with params
    const req = new NextRequest('http://localhost/api/shorturl/abc123');
    const params: RouteParams = { params: { id: 'abc123' } };
    
    // Call the handler
    const response = await GET(req, params);
    const data = await response.json();
    
    // Check response
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error', 'Failed to retrieve short URL');
    
    // Check console error was called
    expect(console.error).toHaveBeenCalled();
  });
}); 