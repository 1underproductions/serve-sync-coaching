
import { createContext } from 'react';
import { AuthContextType } from './types/authTypes';

// Create the Auth Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Re-export the useAuth hook to maintain backward compatibility
export { useAuth } from './useAuth';
