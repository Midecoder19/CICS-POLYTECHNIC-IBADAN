// src/services/SocietyService.js
import { apiClient, API_ENDPOINTS } from '../config/api';

class SocietyService {
  static async getSocieties() {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COMMON.SOCIETY);
      const data = await response.json();

      if (response.ok && data.success) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Failed to fetch societies');
      }
    } catch (error) {
      console.error('Get societies error:', error);
      throw error;
    }
  }

  static async getSociety(id) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.COMMON.SOCIETY}/${id}`);
      const data = await response.json();

      if (response.ok) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch society');
      }
    } catch (error) {
      console.error('Get society error:', error);
      throw error;
    }
  }

  static async getSocietyByCode(code) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.COMMON.SOCIETY}/code/${code}`);
      const data = await response.json();

      if (response.ok) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to fetch society');
      }
    } catch (error) {
      console.error('Get society by code error:', error);
      throw error;
    }
  }

  static async createSociety(societyData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.COMMON.SOCIETY, societyData);
      const data = await response.json();

      if (response.ok) {
        return data.data;
      } else {
        // Include validation errors in the error message
        let errorMessage = data.message || 'Failed to create society';
        if (data.errors && Array.isArray(data.errors)) {
          const validationErrors = data.errors.map(err => err.msg).join(', ');
          errorMessage += `: ${validationErrors}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Create society error:', error);
      throw error;
    }
  }

  static async updateSociety(id, societyData) {
    try {
      console.log('Updating society:', id, societyData);
      const response = await apiClient.put(`${API_ENDPOINTS.COMMON.SOCIETY}/${id}`, societyData);
      console.log('Update response status:', response.status);
      const data = await response.json();
      console.log('Update response data:', data);

      if (response.ok) {
        return data.data;
      } else {
        // Include validation errors in the error message
        let errorMessage = data.message || 'Failed to update society';
        if (data.errors && Array.isArray(data.errors)) {
          const validationErrors = data.errors.map(err => err.msg).join(', ');
          errorMessage += `: ${validationErrors}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Update society error:', error);
      throw error;
    }
  }

  static async deleteSociety(id) {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.COMMON.SOCIETY}/${id}`);
      const data = await response.json();

      if (response.ok) {
        return true;
      } else {
        // Include validation errors in the error message
        let errorMessage = data.message || 'Failed to delete society';
        if (data.errors && Array.isArray(data.errors)) {
          const validationErrors = data.errors.map(err => err.msg).join(', ');
          errorMessage += `: ${validationErrors}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Delete society error:', error);
      throw error;
    }
  }

  static async searchSocieties(query) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.COMMON.SOCIETY}/search/${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Failed to search societies');
      }
    } catch (error) {
      console.error('Search societies error:', error);
      throw error;
    }
  }
}

export default SocietyService;