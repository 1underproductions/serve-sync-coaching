
import React, { ReactNode } from 'react';
import { useAuthProvider } from './hooks/useAuthProvider';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const auth = useAuthProvider(navigate);
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
