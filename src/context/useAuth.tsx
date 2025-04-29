
import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import { AuthContextType } from './types/authTypes';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
