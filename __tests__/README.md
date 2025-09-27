# PuffPass Test Suite

## Overview
Comprehensive Jest test suite for the PuffPass authentication system, covering unit tests, integration tests, and API endpoint testing.

## Test Structure

### Unit Tests
- `lib/crypto-utils.test.ts` - Password hashing and verification
- `lib/auth.test.ts` - JWT token creation and validation

### API Tests
- `api/auth/register.test.ts` - Registration endpoint testing
- `api/auth/login.test.ts` - Login endpoint testing

### Integration Tests
- `integration/auth-flow.test.ts` - Complete authentication flow testing

## Running Tests

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run only auth-related tests
npm run test:auth

# Run for CI/CD
npm run test:ci
\`\`\`

## Test Coverage Goals

- **Crypto Utils**: 100% coverage (critical security functions)
- **Auth Utils**: 100% coverage (JWT handling)
- **API Routes**: 90%+ coverage (all success/error paths)
- **Integration**: 80%+ coverage (main user flows)

## Mock Strategy

- **Database**: Mocked with in-memory arrays for predictable testing
- **Environment**: Test-specific JWT secrets and database URLs
- **Next.js**: Router and navigation mocked for component testing
- **External APIs**: Mocked to avoid external dependencies

## Debugging Tests

Add debug logging to tests:
\`\`\`javascript
console.log('[TEST]', 'Debug message', data)
\`\`\`

Run specific test files:
\`\`\`bash
npm test -- crypto-utils.test.ts
\`\`\`

Run tests with verbose output:
\`\`\`bash
npm test -- --verbose
\`\`\`

## CI/CD Integration

The `test:ci` script is optimized for continuous integration:
- No watch mode
- Coverage reporting
- Fail on coverage thresholds
- Deterministic test order
