
import React from 'react';
import { Navigate } from 'react-router-dom';

// Simple feature flag management
export const FEATURE_FLAGS = {
  ANALYTICS: false,
  PAYMENTS: true,
  MESSAGES: true,
  WAITLIST: true, // Ensure waitlist functionality is enabled
  // Add more features as needed
};

type FeatureToggleProps = {
  featureName: keyof typeof FEATURE_FLAGS;
  children: React.ReactNode;
};

/**
 * A component that conditionally renders its children based on feature flags
 * If the feature is not enabled, it redirects to the coming soon page
 */
const FeatureToggle = ({ featureName, children }: FeatureToggleProps) => {
  const isEnabled = FEATURE_FLAGS[featureName];
  console.log(`Feature ${featureName} is ${isEnabled ? 'enabled' : 'disabled'}`);

  if (!isEnabled) {
    return <Navigate to="/coming-soon" />;
  }

  return <>{children}</>;
};

export default FeatureToggle;
