
import '@testing-library/jest-dom';

// This extends the expect object with Jest DOM matchers
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeInTheDocument(): T;
      toHaveClass(...classNames: string[]): T;
      toBeDisabled(): T;
      // Add any other custom matchers you might need in the future
    }
  }
}
