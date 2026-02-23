import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import memberService from '../services/MemberAuthService';

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null
};

// Action types
const AUTH_SUCCESS = 'AUTH_SUCCESS';
const AUTH_FAILURE = 'AUTH_FAILURE';
const LOGOUT = 'LOGOUT';
const CLEAR_ERROR = 'CLEAR_ERROR';
const SET_LOADING = 'SET_LOADING';

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      };
    case AUTH_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      };
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    case CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

// Create context
const MemberAuthContext = createContext();

// Provider component
export const MemberAuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const auth = useAuth();

  // Check for existing token on mount or when auth user changes
  useEffect(() => {
    const token = localStorage.getItem('memberToken');
    const user = localStorage.getItem('memberUser');

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: AUTH_SUCCESS,
          payload: {
            user: parsedUser,
            token
          }
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('memberToken');
        localStorage.removeItem('memberUser');
      }
    } else if (auth.user && auth.user.role === 'member' && auth.isAuthenticated) {
      // If main auth has a member logged in, automatically set member auth
      const token = localStorage.getItem('token');
      localStorage.setItem('memberToken', token);
      localStorage.setItem('memberUser', JSON.stringify(auth.user));
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          user: auth.user,
          token: token
        }
      });
    }
    dispatch({ type: SET_LOADING, payload: false });
  }, [auth.user, auth.isAuthenticated]);

  // Login function
  const login = async (memberId, password) => {
    try {
      dispatch({ type: SET_LOADING, payload: true });
      
      const response = await memberService.login(memberId, password);
      
      if (response.success) {
        // Store in localStorage
        localStorage.setItem('memberToken', response.data.token);
        localStorage.setItem('memberUser', JSON.stringify(response.data.user));
        
        dispatch({
          type: AUTH_SUCCESS,
          payload: {
            user: response.data.user,
            token: response.data.token
          }
        });
        
        return { success: true };
      } else {
        dispatch({
          type: AUTH_FAILURE,
          payload: response.message
        });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.message || 'Login failed';
      dispatch({
        type: AUTH_FAILURE,
        payload: message
      });
      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    memberService.logout();
    // Also logout from main auth context
    auth.logout();
    dispatch({ type: LOGOUT });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    logout,
    clearError
  };

  return (
    <MemberAuthContext.Provider value={value}>
      {children}
    </MemberAuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useMemberAuth = () => {
  const context = useContext(MemberAuthContext);
  if (!context) {
    throw new Error('useMemberAuth must be used within a MemberAuthProvider');
  }
  return context;
};
