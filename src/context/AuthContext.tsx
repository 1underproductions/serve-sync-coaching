
import { createContext } from 'react';
import { AuthContextType } from './types/authTypes';

// Create the Auth Context with a default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Re-export the useAuth hook for convenience
export { useAuth } from './useAuth';
