
# Testing Guide for Tennexis Platform

This document outlines the testing strategy for the Tennexis platform to maintain stability as the application grows.

## Running Tests

Add the following script to your package.json:

```json
"scripts": {
  "test": "vitest",
  "coverage": "vitest run --coverage"
}
```

To run tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm run coverage
```

## Testing Strategy

### 1. Unit Tests

Unit tests verify that individual units of code (functions, components, hooks) work as expected in isolation.

- **Component Tests**: Test UI components render correctly and respond to user interactions.
- **Utility Tests**: Verify utility functions produce expected output for given inputs.
- **Hook Tests**: Ensure custom hooks manage state and side effects correctly.

### 2. Integration Tests

Integration tests verify that multiple units work together correctly.

- **Page Tests**: Test that pages compose components correctly and handle data flow.
- **Feature Tests**: Verify complete features work across components.

### 3. End-to-End Tests (Future)

Consider adding Cypress or Playwright for end-to-end testing to simulate real user flows through the application.

## Best Practices

1. **Write Tests for New Features**: Always add tests for new features before merging.
2. **Test Critical Paths**: Focus on testing business-critical functionality.
3. **Run Tests Before Deployment**: Always run tests before deploying to production.
4. **Keep Tests Maintainable**: Tests should be easy to understand and update.
5. **Use Mocks Appropriately**: Mock external dependencies but test integration points carefully.

## Continuous Integration

Consider setting up GitHub Actions or another CI provider to run tests automatically on pull requests.

Example GitHub Actions workflow:

```yaml
name: Test

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 16
      - run: npm ci
      - run: npm test
```

## Regression Testing

When fixing bugs:

1. Write a test that reproduces the bug
2. Fix the bug
3. Verify the test passes

This ensures the bug doesn't return in future changes.
