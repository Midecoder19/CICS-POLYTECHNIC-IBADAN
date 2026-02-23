// src/services/AuthService.js
import { apiClient, API_ENDPOINTS } from '../config/api';

class AuthService {
  static async login(username, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        username,
        password
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store user data and tokens
        localStorage.setItem("user", JSON.stringify(data.data.user));
        localStorage.setItem("token", data.data.token);
        if (data.data.refreshToken) {
          localStorage.setItem("refreshToken", data.data.refreshToken);
        }
        return data.data.user;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Network error during login');
    }
  }

  static async register(userData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Network error during registration');
    }
  }

  static async verifyEmail(email, code) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { email, code });
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      throw new Error(error.message || 'Network error during email verification');
    }
  }

  static async verifyPhone(phone, code) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_PHONE, { phone, code });
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Phone verification failed');
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      throw new Error(error.message || 'Network error during phone verification');
    }
  }

  static async resendEmailVerification(email) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_EMAIL_VERIFICATION, { email });
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to resend email verification');
      }
    } catch (error) {
      console.error('Resend email verification error:', error);
      throw new Error(error.message || 'Network error resending email verification');
    }
  }

  static async resendPhoneVerification(phone) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_PHONE_VERIFICATION, { phone });
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Failed to resend phone verification');
      }
    } catch (error) {
      console.error('Resend phone verification error:', error);
      throw new Error(error.message || 'Network error resending phone verification');
    }
  }

  static async forgotPassword(email) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Password reset request failed');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw new Error(error.message || 'Network error during password reset request');
    }
  }

  static async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword
      });
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw new Error(error.message || 'Network error during password reset');
    }
  }

  static async getProfile() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
      const data = await response.json();

      if (response.ok && data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to get profile');
      }
    } catch (error) {
      console.error('Get profile error:', error);
      throw new Error(error.message || 'Network error getting profile');
    }
  }

  static async updateProfile(profileData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.AUTH.PROFILE, profileData);
      const data = await response.json();

      if (response.ok) {
        // Update stored user data
        localStorage.setItem("user", JSON.stringify(data.user));
        return data.user;
      } else {
        throw new Error(data.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Network error updating profile');
    }
  }

  static async logout() {
    try {
      // Call logout endpoint (optional, but good practice)
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    }

    // Clear all stored data
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }

  static getUser() {
    try {
      const data = localStorage.getItem("user");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Clear invalid data
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      return null;
    }
  }

  static getToken() {
    return localStorage.getItem("token");
  }

  static getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }

  static isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return token && user;
  }
}

export default AuthService;
