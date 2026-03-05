// API Configuration
import { performanceUtils } from '../utils/performance.js';

// ============================================================
// CONFIGURATION FOR LOCAL AND NETWORK ACCESS
// ============================================================
// For LOCAL development: use localhost
// For NETWORK access: use your computer's IP address
// 
// TO FIND YOUR IP (Windows): ipconfig
// TO FIND YOUR IP (Mac/Linux): ifconfig
// Example: const STATIC_LAN_IP = 'http://192.168.1.100';
// ============================================================
const STATIC_LAN_IP = 'http://localhost'; // Change to your PC's IP address for network access
const API_PORT = '3003';
const USE_NETWORK_IP = false; // Set to true for network access, false for localhost
// ============================================================

// Determine API URL based on configuration
const getApiBaseUrl = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    console.log(`🔗 API URL (env): ${import.meta.env.VITE_API_URL}`);
    return import.meta.env.VITE_API_URL;
  }
  
  // Use network IP if enabled
  if (USE_NETWORK_IP && STATIC_LAN_IP !== 'http://localhost') {
    const url = `${STATIC_LAN_IP}:${API_PORT}/api`;
    console.log(`🔗 API URL (network): ${url}`);
    return url;
  }
  
  // Default to localhost
  const url = `http://localhost:${API_PORT}/api`;
  console.log(`🔗 API URL (localhost): ${url}`);
  return url;
};

const API_BASE_URL = getApiBaseUrl();

// For development, you can also hardcode it here:
// const API_BASE_URL = 'http://192.168.1.100:5000/api';


const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_PHONE: '/auth/verify-phone',
    RESEND_EMAIL_VERIFICATION: '/auth/resend-email-verification',
    RESEND_PHONE_VERIFICATION: '/auth/resend-phone-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh',
    PROFILE: '/auth/profile',
  },

  // Dashboard
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ACTIVITY: '/dashboard/activity',
    HEALTH: '/dashboard/health',
  },

  // Common
  COMMON: {
    SOCIETY: '/common/society',
    FINANCIAL_PERIOD: '/common/financial-periods',
    BACKUP: '/common/backup',
    RESTORE: '/common/restore',
    SECURITY: '/common/security',
    DEFAULT_PARAMS: '/common/default-parameters',
    STORE_INFORMATION: '/common/store-information',
    SUPPLIERS: '/common/suppliers',
    PRODUCTS: '/common/products',
    ESSENTIAL_COMMODITIES: '/common/essential-commodities',
  },

  // Account
  ACCOUNT: {
    USERS: '/account/users',
    ROLES: '/account/roles',
    PERMISSIONS: '/account/permissions',
    ORGANIZATION: '/account/organization',
    BRANCH: '/account/branch',
    DEPARTMENT: '/account/department',
    BANK: '/account/bank',
    PAY_COMPONENT: '/account/paycomponent',
    TRANS_TYPE: '/account/transtype',
    LOAN_CATEGORY: '/account/loancategory',
    JOURNAL_CATEGORY: '/account/journalcategory',
    MEMBER_LOAN_MASTER: '/account/memberloanmaster',
    SAVINGS_REQUEST: '/account/savingsrequest',
    MAINTAIN_ACCOUNT: '/account/maintain',
  },

  // Stock
  STOCK: {
    STORE_INFO: '/common/store-information',
    ESSENTIAL_COMMODITY: '/common/essential-commodities',
    SUPPLIER_INFO: '/common/suppliers',
    SUPPLIER_BALANCE: '/common/supplier-opening-balances',
    PRODUCT_SETUP: '/common/products',
    MAINTAIN_STOCK: '/common/stock-balances',
    PRODUCT_BALANCE: '/common/product-opening-balances',
    PRODUCT_INFO: '/common/products',
    LPO: '/common/stock-receipts',
    RECEIPT_VOUCHER: '/common/stock-receipts',
    SALES: '/stock/sales',
  },
};

class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  // Get authorization header
  getAuthHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Generic request method
  async request(endpoint, options = {}) {
    // Build URL with query params if provided
    let url = `${this.baseURL}${endpoint}`;
    console.log('API Request URL:', url); // Debug log
    if (options.params) {
      const searchParams = new URLSearchParams(options.params);
      url += `?${searchParams.toString()}`;
    }
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Cache successful GET responses
      if (options.method === 'GET' && response.ok) {
        try {
          const responseClone = response.clone();
          const data = await responseClone.json();
          performanceUtils.aggressiveCache.cacheApiResponse(url, data);
        } catch (cacheError) {
          console.warn('Response caching failed:', cacheError);
        }
      }

      // Handle token refresh on 401
      if (response.status === 401) {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');

        // Only attempt refresh if we have a token (i.e., user was logged in)
        if (token && refreshToken) {
          try {
            const refreshResponse = await this.request(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
              method: 'POST',
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              localStorage.setItem('token', data.token);
              // Retry original request
              return this.request(endpoint, options);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }

        // For auth endpoints (login, register), let the actual error through
        if (endpoint.includes('/auth/')) {
          // Don't throw generic error, let the response handling below show the actual error
          // Just clear any existing tokens since this is a fresh auth attempt
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        } else {
          // For other endpoints, logout and redirect
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      // Handle non-OK responses
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.clone().json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If not JSON, get text
          try {
            const text = await response.text();
            errorMessage = text || errorMessage;
          } catch (textError) {
            // Keep default message
          }
        }
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

// Create and export API client instance
const apiClient = new ApiClient(API_BASE_URL);

export {
  API_BASE_URL,
  API_ENDPOINTS,
  apiClient,
  ApiClient,
};

// Create a named export 'api' for backward compatibility
export const api = apiClient;

