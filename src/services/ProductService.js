import { apiClient, API_ENDPOINTS } from '../config/api';

class ProductService {
  // Get all products
  async getProducts(societyId = null) {
    try {
      const params = societyId ? { society: societyId } : {};
      const response = await apiClient.get(API_ENDPOINTS.COMMON.PRODUCTS, { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get single product
  async getProduct(id) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.COMMON.PRODUCTS}/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Create product
  async createProduct(productData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.COMMON.PRODUCTS, productData);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(id, productData) {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.COMMON.PRODUCTS}/${id}`, productData);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(id) {
    try {
      const response = await apiClient.delete(`${API_ENDPOINTS.COMMON.PRODUCTS}/${id}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Search products
  async searchProducts(query, societyId = null) {
    try {
      const params = { query };
      if (societyId) params.society = societyId;
      const response = await apiClient.get(`${API_ENDPOINTS.COMMON.PRODUCTS}/search`, { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Get stores for dropdown
  async getStores(societyId = null) {
    try {
      const params = societyId ? { society: societyId } : {};
      const response = await apiClient.get(API_ENDPOINTS.COMMON.STORE_INFORMATION, { params });
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
      const response = await apiClient.get(API_ENDPOINTS.COMMON.SUPPLIERS, { params });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  // Get units/measures
  async getUnits() {
    // This could be a static list or fetched from backend
    return {
      success: true,
      data: [
        { code: 'KG', name: 'Kilogram' },
        { code: 'L', name: 'Liter' },
        { code: 'PC', name: 'Piece' },
        { code: 'BOX', name: 'Box' },
        { code: 'DOZ', name: 'Dozen' },
        { code: 'GM', name: 'Gram' },
        { code: 'ML', name: 'Milliliter' },
        { code: 'M', name: 'Meter' },
        { code: 'FT', name: 'Feet' },
        { code: 'IN', name: 'Inch' }
      ]
    };
  }
}

const productService = new ProductService();
export default productService;
