import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ShortUrlRedirect from '../page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation');

// Mock the fetch function
global.fetch = jest.fn();

describe('ShortUrlRedirect Page', () => {
  // Mock router
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up router mock
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });
  
  it('renders a loading state while redirecting', () => {
    // Mock fetch to delay resolution
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    
    render(<ShortUrlRedirect params={{ id: 'abc123' }} />);
    
    // Should show loading message
    expect(screen.getByText(/redirecting/i)).toBeInTheDocument();
    expect(screen.getByText(/please wait/i)).toBeInTheDocument();
  });
  
  it('redirects to the budget page with state when fetch succeeds', async () => {
    // Mock successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ state: 'encoded-state-value' }),
    });
    
    render(<ShortUrlRedirect params={{ id: 'abc123' }} />);
    
    // Wait for fetch and redirect
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/budget?s=encoded-state-value');
    });
    
    // Check fetch was called with the right URL
    expect(global.fetch).toHaveBeenCalledWith('/api/shorturl/abc123');
  });
  
  it('redirects to home page when fetch fails', async () => {
    // Mock failed fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Not found' }),
    });
    
    render(<ShortUrlRedirect params={{ id: 'nonexistent' }} />);
    
    // Wait for fetch and redirect
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
    
    // Should also log error
    expect(console.error).toHaveBeenCalled();
  });
  
  it('redirects to home page when state is missing from response', async () => {
    // Mock response with missing state
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ someOtherProperty: 'value' }),
    });
    
    render(<ShortUrlRedirect params={{ id: 'abc123' }} />);
    
    // Wait for fetch and redirect
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });
  
  it('redirects to home page when fetch throws an error', async () => {
    // Mock fetch to throw
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    render(<ShortUrlRedirect params={{ id: 'abc123' }} />);
    
    // Wait for fetch and redirect
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
    
    // Should also log error
    expect(console.error).toHaveBeenCalled();
  });
}); 