
/**
 * Environment utilities for multi-environment configuration
 */

// Available environments
export type Environment = 'development' | 'staging' | 'production';

// Get current environment
export const getCurrentEnvironment = (): Environment => {
  const envFromVar = import.meta.env.VITE_APP_ENV;
  
  if (envFromVar === 'staging') return 'staging';
  if (envFromVar === 'production') return 'production';
  
  // Default to development
  return 'development';
};

// Check if in development mode
export const isDevelopment = (): boolean => getCurrentEnvironment() === 'development';

// Check if in staging mode
export const isStaging = (): boolean => getCurrentEnvironment() === 'staging';

// Check if in production mode
export const isProduction = (): boolean => getCurrentEnvironment() === 'production';

// Get environment-specific flag for features
export const getFeatureFlag = (
  featureName: string, 
  config: { development?: boolean; staging?: boolean; production?: boolean }
): boolean => {
  const env = getCurrentEnvironment();
  return config[env] ?? false;
};
