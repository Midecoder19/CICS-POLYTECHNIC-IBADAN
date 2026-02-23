import axios from 'axios';
import { API_BASE_URL } from '../config/api';

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

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('memberToken');
          window.location.href = '/member/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Member login
  async login(memberId, password) {
    const response = await this.api.post('/member/auth/login', {
      memberId,
      password,
    });
    return response.data;
  }

  // Get member profile
  async getProfile() {
    const response = await this.api.get('/member/profile');
    return response.data;
  }

  // Get member loans
  async getLoans() {
    const response = await this.api.get('/member/loans');
    return response.data;
  }

  // Get member ledger
  async getLedger() {
    const response = await this.api.get('/member/ledger');
    return response.data;
  }

  // Set auth token
  setToken(token) {
    localStorage.setItem('memberToken', token);
  }

  // Remove auth token
  removeToken() {
    localStorage.removeItem('memberToken');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('memberToken');
  }
}

export default new MemberService();
