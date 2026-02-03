// Simple in-memory cache implementation for both client and server
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

// Client-side cache functions
export async function fetchCached(
  url: string,
  options: { ttlMs?: number; version?: string | number } = {}
): Promise<any> {
  const { ttlMs = 60000, version } = options;
  const cacheKey = `${url}:${version || ''}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }

  // Fetch fresh data
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Store in cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });

    return data;
  } catch (error) {
    console.error('Cache fetch error:', error);
    throw error;
  }
}

export function cacheInvalidate(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  // Remove entries matching the pattern
  // Handle both full URLs and patterns like "GET:/api/..."
  const normalizedPattern = pattern.replace(/^GET:/, '').replace(/^POST:/, '').replace(/^PUT:/, '').replace(/^DELETE:/, '');
  
  for (const key of cache.keys()) {
    // Check if key starts with the pattern (URL) or contains it
    if (key.startsWith(normalizedPattern) || key.includes(normalizedPattern)) {
      cache.delete(key);
    }
  }
}

export function cacheSet(key: string, data: any, ttlMs: number = 60000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
}

export function cacheGet(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  return null;
}

// Server-side cache object with wrap and invalidatePrefix methods
const serverCache = {
  wrap: async function<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    const data = await fn();
    cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
    return data;
  },

  invalidatePrefix: function(prefix: string): void {
    for (const key of cache.keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key);
      }
    }
  }
};

// Default export for server-side use
export default serverCache;

