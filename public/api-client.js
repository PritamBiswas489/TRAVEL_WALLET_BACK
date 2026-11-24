/**
 * API utility for fetching tokens and making authenticated requests
 * Uses the same namespace and token structure as swagger-restore-api.js
 */

const NS = 'api_docs_travel_wallet_';

class APIClient {
  constructor() {
    this.namespace = NS;
    this.updateTokens();
  }

  /**
   * Get stored authorization data from localStorage
   * Follows the same structure as swagger-restore-api.js
   */
  getAuthData() {
    try {
      const raw = localStorage.getItem(this.namespace + 'authorized');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (error) {
      console.error('[APIClient] Failed to parse auth data:', error);
      return null;
    }
  }

  /**
   * Get access token from stored authorization data
   */
  getAccessToken() {
    // Try from namespaced authorized key (Swagger format)
    const authData = this.getAuthData();
    if (authData?.bearerAuth?.value) {
      return authData.bearerAuth.value;
    }

    // Fallback to direct localStorage keys
    return localStorage.getItem('accessToken') || localStorage.getItem('accesstoken');
  }

  /**
   * Get refresh token from stored authorization data
   */
  getRefreshToken() {
    // Try from namespaced authorized key (Swagger format)
    const authData = this.getAuthData();
    if (authData?.refreshToken?.value) {
      return authData.refreshToken.value;
    }

    // Fallback to direct localStorage keys
    return localStorage.getItem('refreshToken') || localStorage.getItem('refreshtoken');
  }

  /**
   * Update tokens from localStorage
   */
  updateTokens() {
    this.accessToken = this.getAccessToken();
    this.refreshToken = this.getRefreshToken();

    console.log('[APIClient] Tokens updated:', {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    });

    if (!this.accessToken) {
      console.warn('[APIClient] No access token found in localStorage');
    }
  }

  /**
   * Get authorization headers for API requests
   */
  getAuthHeaders() {
    this.updateTokens();
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    if (this.refreshToken) {
      headers['refreshtoken'] = this.refreshToken;
    }

    return headers;
  }

  /**
   * Make authenticated request to API
   */
  async request(url, options = {}) {
    const headers = this.getAuthHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData}`);
    }

    return response.json();
  }

  /**
   * POST request with URLSearchParams body
   */
  async post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: new URLSearchParams(data),
    });
  }

  /**
   * GET request
   */
  async get(url) {
    return this.request(url, {
      method: 'GET',
    });
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!(this.getAccessToken());
  }

  /**
   * Get current auth status
   */
  getAuthStatus() {
    return {
      isAuthenticated: this.isAuthenticated(),
      hasAccessToken: !!this.accessToken,
      hasRefreshToken: !!this.refreshToken,
      authData: this.getAuthData(),
    };
  }
}

export const apiClient = new APIClient();

