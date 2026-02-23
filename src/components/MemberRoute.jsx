import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMemberAuth } from '../contexts/MemberAuthContext';

const MemberRoute = ({ children }) => {
  const { user, isAuthenticated } = useMemberAuth();

  // Check if user is authenticated and is a member
  if (!isAuthenticated || !user || user.role !== 'member') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default MemberRoute;
