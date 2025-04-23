
import '@testing-library/jest-dom';
import { expect } from 'vitest';
// The matchers are now directly exported from the base package
import * as matchers from '@testing-library/jest-dom';

// Extend Vitest's expect with Jest DOM matchers
expect.extend(matchers);

// Optionally add type declarations to help TypeScript understand the matchers
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeInTheDocument(): T;
    toHaveClass(...classNames: string[]): T;
    toBeDisabled(): T;
  }
}
