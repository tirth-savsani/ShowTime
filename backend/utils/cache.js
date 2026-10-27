/**
 * Lightweight In-Memory TTL Cache (Phase 4)
 * Provides ultra-fast caching for catalogue and metadata endpoints.
 */

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds = 60) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  del(pattern) {
    if (typeof pattern === 'string') {
      this.store.delete(pattern);
      return;
    }
    if (pattern instanceof RegExp) {
      for (const key of this.store.keys()) {
        if (pattern.test(key)) {
          this.store.delete(key);
        }
      }
    }
  }

  clear() {
    this.store.clear();
  }
}

export const memoryCache = new MemoryCache();

/**
 * Express middleware for caching GET endpoints
 * @param {number} ttlSeconds Time-to-live in seconds (default: 60)
 */
export const cacheMiddleware = (ttlSeconds = 60) => {
  return (req, res, next) => {
    // Only cache GET requests in non-test mode or when enabled
    if (req.method !== 'GET' || process.env.NODE_ENV === 'test') {
      return next();
    }

    const cacheKey = req.originalUrl || req.url;
    const cachedResponse = memoryCache.get(cacheKey);

    if (cachedResponse) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(cachedResponse.statusCode || 200).json(cachedResponse.body);
    }

    // Intercept res.json to capture response body
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only cache successful 200 responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(cacheKey, { statusCode: res.statusCode, body }, ttlSeconds);
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
};

export default {
  memoryCache,
  cacheMiddleware,
};
