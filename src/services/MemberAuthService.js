import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class MemberService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('memberToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('memberToken');
          localStorage.removeItem('memberUser');
          window.location.href = '/member/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Member login
  async login(memberId, password) {
    try {
      const response = await this.api.post('/member/auth/login', {
        memberId,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Login failed' };
    }
  }

  // Get member profile
  async getProfile() {
    try {
      const response = await this.api.get('/member/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get profile' };
    }
  }

  // Get member loans
  async getLoans(page = 1, limit = 50) {
    try {
      const response = await this.api.get('/member/loans', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get loans' };
    }
  }

  // Get member ledger
  async getLedger(page = 1, limit = 50) {
    try {
      const response = await this.api.get('/member/ledger', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get ledger' };
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('memberToken');
    localStorage.removeItem('memberUser');
    window.location.href = '/member/login';
  }
}

const memberService = new MemberService();
export default memberService;
