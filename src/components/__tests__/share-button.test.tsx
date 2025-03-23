import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom for the matchers
import { ShareButton } from '../share-button';
import { encodeState } from '@/utils/url-state';
import { City } from '@/types';

// Mock the url-state module
jest.mock('@/utils/url-state', () => ({
  encodeState: jest.fn(),
}));

// Mock data
const mockCity: City = { 
  id: 'city1', 
  name: 'Test City', 
  country: 'Test Country',
  currency: 'EUR',
  latitude: 41.3851,
  longitude: 2.1734
};

const mockBudgetParams = {
  accommodation: { amount: 500, deposit: 200, isShared: true, numberOfPeople: 2 },
  utilities: { amount: 100, isShared: true },
  groceries: { amount: 200, isShared: false },
  transport: { amount: 50, isShared: false },
  entertainment: { amount: 100, isShared: false },
  dining: { amount: 150, isShared: false },
  leisure: { amount: 50, isShared: false },
  other: { amount: 50, isShared: false },
};
const mockFlights = [
  { id: 'flight1', price: 100, description: 'Test Flight', date: '2023-05-01', isShared: false }
];
const mockScholarship = {
  monthlyGrant: 850,
  maxMonths: 6,
  travelSupport: 350,
  additionalSupport: 0
};

describe('ShareButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock encodeState to return a predictable value
    (encodeState as jest.Mock).mockReturnValue('encoded-state-value');
    
    // Mock successful fetch response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ shortUrl: 'http://example.com/s/abc123', id: 'abc123' }),
    });
    
    // Mock clipboard API
    navigator.clipboard.writeText = jest.fn().mockResolvedValue(undefined);
  });
  
  it('renders correctly', () => {
    render(
      <ShareButton 
        city={mockCity}
        stayDuration={5}
        budgetParams={mockBudgetParams}
        flights={mockFlights}
        scholarship={mockScholarship}
      />
    );
    
    // Check that the button is rendered
    const button = screen.getByRole('button', { name: /share/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });
  
  it('is disabled when no city is selected', () => {
    render(
      <ShareButton 
        city={null}
        stayDuration={5}
        budgetParams={mockBudgetParams}
        flights={mockFlights}
        scholarship={mockScholarship}
      />
    );
    
    // Check that the button is disabled
    const button = screen.getByRole('button', { name: /share/i });
    expect(button).toBeDisabled();
  });
  
  it('shows loading state while generating short URL', async () => {
    // Create a delayed promise for fetch
    global.fetch = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ shortUrl: 'http://example.com/s/abc123', id: 'abc123' }),
          });
        }, 100);
      });
    });
    
    render(
      <ShareButton 
        city={mockCity}
        stayDuration={5}
        budgetParams={mockBudgetParams}
        flights={mockFlights}
        scholarship={mockScholarship}
      />
    );
    
    // Click the share button
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);
    
    // Check for loading state
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });
  
  it('successfully shares a URL and shows copied confirmation', async () => {
    render(
      <ShareButton 
        city={mockCity}
        stayDuration={5}
        budgetParams={mockBudgetParams}
        flights={mockFlights}
        scholarship={mockScholarship}
      />
    );
    
    // Click the share button
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);
    
    // Wait for the success state
    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
    
    // Check that the state was encoded correctly
    expect(encodeState).toHaveBeenCalledWith({
      cityId: mockCity.id,
      budgetParams: mockBudgetParams,
      flights: mockFlights,
      scholarship: mockScholarship,
      stayDuration: 5
    });
    
    // Check that fetch was called with the correct parameters
    expect(fetch).toHaveBeenCalledWith('/api/shorturl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state: 'encoded-state-value' }),
    });
    
    // Check that the clipboard API was called with the short URL
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://example.com/s/abc123');
  });
  
  it('falls back to direct URL when shortening service fails', async () => {
    // Mock a failed fetch response
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' }),
    });
    
    render(
      <ShareButton 
        city={mockCity}
        stayDuration={5}
        budgetParams={mockBudgetParams}
        flights={mockFlights}
        scholarship={mockScholarship}
      />
    );
    
    // Click the share button
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);
    
    // Wait for the fallback to complete
    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
    
    // Check for fallback error message
    expect(screen.getByText(/short url service unavailable/i)).toBeInTheDocument();
    
    // Check that the clipboard API was called with a direct URL
    const callArg = (navigator.clipboard.writeText as jest.Mock).mock.calls[0][0];
    expect(callArg).toContain('?s=encoded-state-value');
  });
  
  it('handles fetch rejection', async () => {
    // Mock fetch to reject
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    render(
      <ShareButton 
        city={mockCity}
        stayDuration={5}
        budgetParams={mockBudgetParams}
        flights={mockFlights}
        scholarship={mockScholarship}
      />
    );
    
    // Click the share button
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);
    
    // Wait for the fallback to complete
    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
    
    // Should still fall back to direct URL
    const callArg = (navigator.clipboard.writeText as jest.Mock).mock.calls[0][0];
    expect(callArg).toContain('?s=encoded-state-value');
  });
  
  it('shows an error if clipboard API fails', async () => {
    // Mock clipboard to fail
    navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Clipboard error'));
    
    render(
      <ShareButton 
        city={mockCity}
        stayDuration={5}
        budgetParams={mockBudgetParams}
        flights={mockFlights}
        scholarship={mockScholarship}
      />
    );
    
    // Click the share button
    const button = screen.getByRole('button', { name: /share/i });
    fireEvent.click(button);
    
    // Wait for the error
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    
    // Should show error message
    expect(screen.getByText(/failed to share budget/i)).toBeInTheDocument();
  });
}); 