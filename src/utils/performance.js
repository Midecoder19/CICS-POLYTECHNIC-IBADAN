// Performance optimization utilities
export const performanceUtils = {
  // Debounce function for search inputs
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function for scroll/resize events
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  },

  // Preload critical resources
  preloadCriticalResources: () => {
    // Preload critical images
    const criticalImages = [
      '/images/logo.png',
      '/images/login-bg.jpg'
    ];

    criticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  },

  // Optimize images with lazy loading
  lazyLoadImages: () => {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  },

  // Cache API responses
  cache: {
    set: (key, data, ttl = 300000) => { // 5 minutes default
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      };
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(item));
      } catch (e) {
        // Handle storage quota exceeded
        console.warn('Cache storage failed:', e);
      }
    },

    get: (key) => {
      try {
        const item = JSON.parse(localStorage.getItem(`cache_${key}`));
        if (item && (Date.now() - item.timestamp) < item.ttl) {
          return item.data;
        }
        // Remove expired cache
        localStorage.removeItem(`cache_${key}`);
        return null;
      } catch (e) {
        return null;
      }
    },

    clear: (key) => {
      localStorage.removeItem(`cache_${key}`);
    }
  },

  // Optimize bundle loading
  loadScript: (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  // Monitor performance
  monitorPerformance: () => {
    // Monitor Core Web Vitals
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }

    // Monitor navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Performance:', {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          totalTime: perfData.loadEventEnd - perfData.fetchStart
        });
      }, 0);
    });
  },

  // Service Worker communication
  serviceWorker: {
    postMessage: (message) => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message);
      }
    },

    updateCache: (url, data) => {
      performanceUtils.serviceWorker.postMessage({
        type: 'UPDATE_CACHE',
        url,
        data
      });
    }
  },

  // Aggressive caching with service worker integration
  aggressiveCache: {
    // Cache API responses with service worker
    cacheApiResponse: (url, response, ttl = 300000) => {
      // Store in localStorage as backup
      performanceUtils.cache.set(url, response, ttl);

      // Also update service worker cache
      performanceUtils.serviceWorker.updateCache(url, response);
    },

    // Get cached response with fallback
    getCachedResponse: (url) => {
      // Try localStorage first (faster)
      let cached = performanceUtils.cache.get(url);
      if (cached) return cached;

      // Fallback to service worker cache via message
      return new Promise((resolve) => {
        const messageHandler = (event) => {
          if (event.data && event.data.type === 'CACHE_RESPONSE' && event.data.url === url) {
            navigator.serviceWorker.removeEventListener('message', messageHandler);
            resolve(event.data.data);
          }
        };

        navigator.serviceWorker.addEventListener('message', messageHandler);

        performanceUtils.serviceWorker.postMessage({
          type: 'GET_CACHE',
          url
        });

        // Timeout fallback
        setTimeout(() => {
          navigator.serviceWorker.removeEventListener('message', messageHandler);
          resolve(null);
        }, 100);
      });
    }
  },
};

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  // Preload critical resources
  performanceUtils.preloadCriticalResources();

  // Lazy load images
  performanceUtils.lazyLoadImages();

  // Monitor performance
  performanceUtils.monitorPerformance();

  // Optimize scroll performance
  let ticking = false;
  const handleScroll = performanceUtils.throttle(() => {
    // Handle scroll events efficiently
    if (!ticking) {
      requestAnimationFrame(() => {
        // Perform scroll-based operations here
        ticking = false;
      });
      ticking = true;
    }
  }, 16); // ~60fps

  window.addEventListener('scroll', handleScroll, { passive: true });
};