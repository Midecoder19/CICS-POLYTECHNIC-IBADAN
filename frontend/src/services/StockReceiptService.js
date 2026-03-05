import { apiClient, API_ENDPOINTS } from '../config/api';

class StockReceiptService {

  // Get all stock receipts
  async getStockReceipts(filters = {}) {
    try {
      const response = await apiClient.get('/common/stock-receipts', { params: filters });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stock receipts:', error);
      throw error;
    }
  }

  // Get single stock receipt
  async getStockReceipt(id) {
    try {
      const response = await apiClient.get(`/common/stock-receipts/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stock receipt:', error);
      throw error;
    }
  }

  // Create stock receipt
  async createStockReceipt(receiptData) {
    try {
      const response = await apiClient.post('/common/stock-receipts', receiptData);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating stock receipt:', error);
      throw error;
    }
  }

  // Update stock receipt
  async updateStockReceipt(id, receiptData) {
    try {
      const response = await apiClient.put(`/common/stock-receipts/${id}`, receiptData);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating stock receipt:', error);
      throw error;
    }
  }

  // Delete stock receipt
  async deleteStockReceipt(id) {
    try {
      const response = await apiClient.delete(`/common/stock-receipts/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting stock receipt:', error);
      throw error;
    }
  }

  // Approve stock receipt (triggers TWS stock balance calculation)
  async approveStockReceipt(id) {
    try {
      const response = await apiClient.put(`/common/stock-receipts/${id}/approve`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error approving stock receipt:', error);
      throw error;
    }
  }

  // Update product purchase price
  async updateProductPrice(productId, newPrice) {
    try {
      const response = await apiClient.put(`/common/products/${productId}`, {
        purchasePrice: newPrice
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating product price:', error);
      throw error;
    }
  }

  // Get stock receipt summary
  async getStockReceiptSummary(filters = {}) {
    try {
      const response = await apiClient.get('/common/stock-receipts/summary', { params: filters });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stock receipt summary:', error);
      throw error;
    }
  }

  // Get stores for dropdown
  async getStores(societyId = null) {
    try {
      const params = societyId ? { society: societyId } : {};
      const response = await apiClient.get('/common/store-information', { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }
  }

  // Get suppliers for dropdown
  async getSuppliers(societyId = null) {
    try {
      const params = societyId ? { society: societyId } : {};
      const response = await apiClient.get('/common/suppliers', { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  // Get products for dropdown
  async getProducts(societyId = null) {
    try {
      const params = societyId ? { society: societyId } : {};
      const response = await apiClient.get('/common/products', { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Search products
  async searchProducts(query, societyId = null) {
    try {
      const params = { query };
      if (societyId) params.society = societyId;
      const response = await apiClient.get('/common/products/search', { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Get financial periods
  async getFinancialPeriods(societyId = null) {
    try {
      const params = societyId ? { society: societyId } : {};
      const response = await apiClient.get('/common/financial-periods', { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching financial periods:', error);
      throw error;
    }
  }

  // Calculate extended amount (quantity * unitPrice)
  calculateExtendedAmount(quantity, unitPrice) {
    return (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0);
  }

  // Calculate total amount from items
  calculateTotalAmount(items) {
    return items.reduce((total, item) => total + (item.extendedAmount || 0), 0);
  }

  // Calculate discount amount (totalAmount * discountRate / 100)
  calculateDiscountAmount(totalAmount, discountRate) {
    return (parseFloat(totalAmount) || 0) * (parseFloat(discountRate) || 0) / 100;
  }

  // Calculate VAT amount ((totalAmount - discountAmount) * vatRate / 100)
  calculateVatAmount(totalAmount, discountAmount, vatRate) {
    const taxableAmount = (parseFloat(totalAmount) || 0) - (parseFloat(discountAmount) || 0);
    return taxableAmount * (parseFloat(vatRate) || 0) / 100;
  }

  // Calculate net pay (totalAmount - discountAmount + vatAmount)
  calculateNetPay(totalAmount, discountAmount, vatAmount) {
    return (parseFloat(totalAmount) || 0) - (parseFloat(discountAmount) || 0) + (parseFloat(vatAmount) || 0);
  }

  // Get total stock balance for a society
  async getTotalStockBalance(societyId) {
    try {
      const response = await apiClient.get(`/common/stock-balances/total/${societyId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching total stock balance:', error);
      throw error;
    }
  }

  // Get next SRV number from server
  async getNextSrvNo(receiptDate = null) {
    try {
      const params = receiptDate ? { receiptDate } : {};
      const response = await apiClient.get('/common/stock-receipts/next-srvno', { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching next SRV number:', error);
      throw error;
    }
  }

  // Generate receipt number (legacy - uses backend format)
  generateReceiptNumber(societyCode, receiptDate) {
    const date = new Date(receiptDate);
    const year = date.getFullYear().toString();
    // In real implementation, this would check the database for the next sequence
    const sequence = '00001'; // Placeholder
    return `${year}${sequence}`;
  }

  // Get default parameters
  async getDefaultParameters(societyId = null) {
    try {
      const params = societyId ? { society: societyId } : {};
      const response = await apiClient.get('/common/default-parameters', { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching default parameters:', error);
      throw error;
    }
  }

  // Get financial periods
  async getFinancialPeriods(societyId = null) {
    try {
      const params = societyId ? { society: societyId } : {};
      const response = await apiClient.get('/common/financial-periods', { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching financial periods:', error);
      throw error;
    }
  }
}

const stockReceiptService = new StockReceiptService();
export default stockReceiptService;
