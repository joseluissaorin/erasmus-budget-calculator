import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// File path for the URL database
const DB_FILE = process.env.URL_DB_FILE || path.join(process.cwd(), 'data', 'url-store.json');

// Type definition for stored URLs
interface StoredUrl {
  id: string;
  originalState: string;
  createdAt: number;
  accessCount: number;
}

// Ensure the data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Initialize the database file if it doesn't exist
function initDbFile() {
  ensureDataDirectory();
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ urls: [] }), 'utf8');
  }
}

// Read the database
function readDb(): { urls: StoredUrl[] } {
  initDbFile();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading URL database:', error);
    return { urls: [] };
  }
}

// Write to the database
function writeDb(data: { urls: StoredUrl[] }) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to URL database:', error);
  }
}

// Generate a short ID
export function generateShortId(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  // Use crypto for better randomness
  const randomBytes = crypto.randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomBytes[i] % chars.length);
  }
  
  return result;
}

// Store a new URL and get a short ID
export function storeUrl(originalState: string): string {
  // Read the current database
  const db = readDb();
  
  // Check if this URL already exists to avoid duplicates
  const existingUrl = db.urls.find(url => url.originalState === originalState);
  if (existingUrl) {
    return existingUrl.id;
  }
  
  // Generate a new unique ID
  let id = generateShortId();
  while (db.urls.some(url => url.id === id)) {
    id = generateShortId();
  }
  
  // Create new entry
  const newUrl: StoredUrl = {
    id,
    originalState,
    createdAt: Date.now(),
    accessCount: 0
  };
  
  // Add to database and save
  db.urls.push(newUrl);
  writeDb(db);
  
  return id;
}

// Get an original URL state by ID
export function getUrlById(id: string): string | null {
  const db = readDb();
  const url = db.urls.find(url => url.id === id);
  
  if (url) {
    // Update access count
    url.accessCount += 1;
    writeDb(db);
    return url.originalState;
  }
  
  return null;
}

// Clean up old URLs (can be run periodically)
export function cleanupOldUrls(maxAgeInDays = 90) {
  const db = readDb();
  const now = Date.now();
  const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000;
  
  db.urls = db.urls.filter(url => now - url.createdAt < maxAge);
  writeDb(db);
} 