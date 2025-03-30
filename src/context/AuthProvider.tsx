
import { createContext, ReactNode } from 'react';
import { useAuthProvider } from './hooks/useAuthProvider';
import { AuthContextType } from './types/authTypes';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthProvider();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
