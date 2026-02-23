import { apiClient, API_ENDPOINTS } from '../config/api';

class StockSalesService {

  // Get all stock sales
  async getStockSales(societyId = null) {
    try {
      const params = societyId ? { society: societyId } : {};
      const response = await apiClient.get(API_ENDPOINTS.STOCK.SALES, { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stock sales:', error);
      throw error;
    }
  }

  // Get single stock sale
  async getStockSale(id) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.STOCK.SALES}/${id}`);
      const data = await response.json();
      return data.success ? data : { success: false, data: null, message: data.message };
    } catch (error) {
      console.error('Error fetching stock sale:', error);
      throw error;
    }
  }

  // Get stock sale by SIV number
  async getStockSaleBySivNo(sivNo, societyId = null) {
    try {
      const params = societyId ? { society: societyId } : {};
      const response = await apiClient.get(`${API_ENDPOINTS.STOCK.SALES}/siv/${sivNo}`, { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stock sale by SIV:', error);
      throw error;
    }
  }

  // Create stock sale
  async createStockSale(saleData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.STOCK.SALES, saleData);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating stock sale:', error);
      throw error;
    }
  }

  // Update stock sale
  async updateStockSale(id, saleData) {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.STOCK.SALES}/${id}`, saleData);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating stock sale:', error);
      throw error;
    }
  }

  // Delete stock sale
  async deleteStockSale(id) {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.STOCK.SALES}/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting stock sale:', error);
      throw error;
    }
  }

  // Post stock sale (complete transaction)
  async postStockSale(id, saleData) {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.STOCK.SALES}/${id}/post`, saleData);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error posting stock sale:', error);
      throw error;
    }
  }

  // Approve stock sale
  async approveStockSale(id) {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.STOCK.SALES}/${id}/approve`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error approving stock sale:', error);
      throw error;
    }
  }

  // Reject stock sale
  async rejectStockSale(id, rejectionReason) {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.STOCK.SALES}/${id}/reject`, { rejectionReason });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error rejecting stock sale:', error);
      throw error;
    }
  }

  // Get stock sales summary
  async getStockSalesSummary(societyId = null, startDate = null, endDate = null) {
    try {
      const params = {};
      if (societyId) params.society = societyId;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get(`${API_ENDPOINTS.STOCK.SALES}/summary`, { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stock sales summary:', error);
      throw error;
    }
  }

  // Search stock sales
  async searchStockSales(query, societyId = null) {
    try {
      const params = { query };
      if (societyId) params.society = societyId;
      const response = await apiClient.get(`${API_ENDPOINTS.STOCK.SALES}/search`, { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching stock sales:', error);
      throw error;
    }
  }

  // Get stores for dropdown
  async getStores(societyId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COMMON.STORE_INFORMATION, {
        params: { society: societyId }
      });
      const data = await response.json();
      return {
        success: true,
        data: data.data, // The controller returns data inside a data property
        message: 'Stores loaded successfully'
      };
    } catch (error) {
      console.error('Error fetching stores:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to load stores'
      };
    }
  }

  // Get products for dropdown
  async getProducts(societyId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COMMON.PRODUCTS, {
        params: { society: societyId }
      });
      const data = await response.json();
      return {
        success: true,
        data: data.data, // The controller returns data inside a data property
        message: 'Products loaded successfully'
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to load products'
      };
    }
  }

  // Get members for dropdown
  async getMembers(societyId = null) {
    try {
      // Fetch members without society filter since imported members may not have society assigned
      const params = { role: 'member' };
      const response = await apiClient.get('/common/members', { params });
      const data = await response.json();
      // Handle the response structure
      if (data.success && data.data && data.data.users) {
        return {
          success: true,
          data: data.data.users,
          message: 'Members loaded successfully'
        };
      }
      return data;
    } catch (error) {
      console.error('Error fetching members:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to load members'
      };
    }
  }

  // Get stock balance for a specific product
  async getProductStockBalance(societyId, productId) {
    try {
      const response = await apiClient.get(`/common/stock-balances/product/${societyId}/${productId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product stock balance:', error);
      throw error;
    }
  }

  // Get all stock balances for a society
  async getStockBalances(societyId) {
    try {
      const response = await apiClient.get('/common/stock-balances', { params: { society: societyId } });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stock balances:', error);
      throw error;
    }
  }

  // Get latest receipt price and stock balance for a product
  async getLatestReceiptPrice(productId, societyId) {
    try {
      const response = await apiClient.get(`/common/stock-receipts/latest-price/${productId}`, {
        params: { society: societyId }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching latest receipt price:', error);
      return { success: false, data: { unitPrice: 0, stockBalance: 0 } };
    }
  }
}

const stockSalesService = new StockSalesService();
export default stockSalesService;
