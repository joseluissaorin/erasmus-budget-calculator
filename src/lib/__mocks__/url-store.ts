// Mock implementation of url-store.ts for testing

// In-memory store for URLs
const urlStore: Record<string, {
  id: string;
  originalState: string;
  createdAt: number;
  accessCount: number;
}> = {};

// Mock implementation of generateShortId
export const generateShortId = jest.fn((length = 6) => {
  // Always return a predictable ID for testing
  return 'abc123';
});

// Mock implementation of storeUrl
export const storeUrl = jest.fn((originalState: string) => {
  // Check if this URL already exists
  const existingUrl = Object.values(urlStore).find(
    (url) => url.originalState === originalState
  );
  
  if (existingUrl) {
    return existingUrl.id;
  }
  
  // Use the mock ID
  const id = generateShortId();
  
  // Create the entry
  urlStore[id] = {
    id,
    originalState,
    createdAt: Date.now(),
    accessCount: 0,
  };
  
  return id;
});

// Mock implementation of getUrlById
export const getUrlById = jest.fn((id: string) => {
  const url = urlStore[id];
  
  if (url) {
    url.accessCount += 1;
    return url.originalState;
  }
  
  return null;
});

// Mock implementation of cleanupOldUrls
export const cleanupOldUrls = jest.fn(() => {
  // Do nothing in the mock
});

// Helper functions for tests
export const _reset = () => {
  Object.keys(urlStore).forEach((key) => {
    delete urlStore[key];
  });
  generateShortId.mockClear();
  storeUrl.mockClear();
  getUrlById.mockClear();
  cleanupOldUrls.mockClear();
};

export const _addMockUrl = (id: string, originalState: string) => {
  urlStore[id] = {
    id,
    originalState,
    createdAt: Date.now(),
    accessCount: 0,
  };
};

export const _getMockStore = () => {
  return { ...urlStore };
}; 