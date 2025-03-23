import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { generateShortId, storeUrl, getUrlById, cleanupOldUrls } from '../url-store';

// Mock the fs and crypto modules
jest.mock('fs');
jest.mock('crypto');
jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('/mock/path/url-store.json'),
  dirname: jest.fn().mockReturnValue('/mock/path'),
}));

describe('URL Store', () => {
  // Mock data
  const mockDbData = { urls: [] };
  const mockState = 'encodedStateString123';
  
  // Setup mocks
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fs.existsSync to return true
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    
    // Mock fs.readFileSync to return mock data
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockDbData));
    
    // Mock crypto.randomBytes
    (crypto.randomBytes as jest.Mock).mockImplementation((size) => {
      const result = Buffer.alloc(size);
      for (let i = 0; i < size; i++) {
        result[i] = i % 62; // Ensures predictable values for character selection
      }
      return result;
    });
  });
  
  describe('generateShortId', () => {
    it('should generate an ID with the default length of 6', () => {
      const id = generateShortId();
      expect(id).toHaveLength(6);
      expect(crypto.randomBytes).toHaveBeenCalledWith(6);
    });
    
    it('should generate an ID with the specified length', () => {
      const id = generateShortId(8);
      expect(id).toHaveLength(8);
      expect(crypto.randomBytes).toHaveBeenCalledWith(8);
    });
    
    it('should use only allowed characters', () => {
      const id = generateShortId();
      const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (const char of id) {
        expect(allowedChars).toContain(char);
      }
    });
  });
  
  describe('storeUrl', () => {
    it('should store a new URL and return the ID', () => {
      const id = storeUrl(mockState);
      
      expect(id).toBeDefined();
      expect(fs.writeFileSync).toHaveBeenCalled();
      
      // Extract the data written to the file
      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const writtenData = JSON.parse(writeCall[1]);
      
      // Check that our URL was added
      expect(writtenData.urls).toHaveLength(1);
      expect(writtenData.urls[0].originalState).toBe(mockState);
      expect(writtenData.urls[0].id).toBe(id);
    });
    
    it('should return existing ID if the state already exists', () => {
      // Set up mock data with an existing URL
      const existingId = 'existingId';
      const mockDataWithUrl = {
        urls: [{ id: existingId, originalState: mockState, createdAt: Date.now(), accessCount: 0 }]
      };
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockDataWithUrl));
      
      // Call storeUrl
      const id = storeUrl(mockState);
      
      // Should return the existing ID
      expect(id).toBe(existingId);
      
      // Should not write to the file
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
    
    it('should handle errors when reading or writing files', () => {
      // Mock fs.readFileSync to throw an error
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Mock file read error');
      });
      
      // Should still work despite the error
      const id = storeUrl(mockState);
      expect(id).toBeDefined();
      
      // Error should be logged
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('getUrlById', () => {
    it('should return the original state when ID exists', () => {
      // Set up mock data with an existing URL
      const existingId = 'existingId';
      const mockDataWithUrl = {
        urls: [{ id: existingId, originalState: mockState, createdAt: Date.now(), accessCount: 0 }]
      };
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockDataWithUrl));
      
      // Call getUrlById
      const result = getUrlById(existingId);
      
      // Should return the state
      expect(result).toBe(mockState);
      
      // Should increment access count
      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const writtenData = JSON.parse(writeCall[1]);
      expect(writtenData.urls[0].accessCount).toBe(1);
    });
    
    it('should return null when ID does not exist', () => {
      const result = getUrlById('nonexistentId');
      expect(result).toBeNull();
    });
    
    it('should handle errors when reading or writing files', () => {
      // Mock fs.readFileSync to throw an error
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Mock file read error');
      });
      
      // Should return null on error
      const result = getUrlById('anyId');
      expect(result).toBeNull();
      
      // Error should be logged
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('cleanupOldUrls', () => {
    it('should remove URLs older than the specified age', () => {
      // Current time
      const now = Date.now();
      
      // Set up mock data with URLs of different ages
      const mockDataWithUrls = {
        urls: [
          { id: 'recent', originalState: 'state1', createdAt: now - 10 * 24 * 60 * 60 * 1000, accessCount: 0 }, // 10 days old
          { id: 'old', originalState: 'state2', createdAt: now - 100 * 24 * 60 * 60 * 1000, accessCount: 0 } // 100 days old
        ]
      };
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockDataWithUrls));
      
      // Call cleanupOldUrls with 30 days max age
      cleanupOldUrls(30);
      
      // Check that old URLs were removed
      const writeCall = (fs.writeFileSync as jest.Mock).mock.calls[0];
      const writtenData = JSON.parse(writeCall[1]);
      
      expect(writtenData.urls).toHaveLength(1);
      expect(writtenData.urls[0].id).toBe('recent');
    });
    
    it('should handle errors when reading or writing files', () => {
      // Mock fs.readFileSync to throw an error
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Mock file read error');
      });
      
      // Should not throw
      expect(() => cleanupOldUrls()).not.toThrow();
      
      // Error should be logged
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 