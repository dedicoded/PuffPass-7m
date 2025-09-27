# PuffPass Authentication Testing Plan

## 🎯 Objective
Validate the complete authentication cycle (registration → login → protected routes) to ensure the crypto/bcryptjs fixes are working and the auth foundation is rock-solid.

---

## 📋 Manual Testing Checklist

### 1. Registration Flow Testing

#### ✅ Happy Path
- [ ] Navigate to `/register`
- [ ] Fill out form with valid data:
  - Email: `test@example.com`
  - Password: `SecurePass123!`
  - Role: `customer`
  - Age: `25`
- [ ] Submit form
- [ ] **Expected**: Success message, user created in database
- [ ] **Debug logs to check**: 
  - `[v0] Starting password hashing with bcryptjs`
  - `[v0] Password hashed successfully`
  - `[v0] User created successfully`

#### ❌ Error Cases
- [ ] **Duplicate email**: Try registering same email twice
- [ ] **Invalid email**: Use malformed email address
- [ ] **Weak password**: Use password under 8 characters
- [ ] **Underage**: Set age under 21
- [ ] **Missing fields**: Submit with empty required fields

### 2. Login Flow Testing

#### ✅ Happy Path
- [ ] Navigate to `/login`
- [ ] Use credentials from registration test
- [ ] Select correct role (customer/merchant/admin)
- [ ] Submit form
- [ ] **Expected**: JWT cookie set, redirect to role dashboard
- [ ] **Debug logs to check**:
  - `[v0] Comparing password with bcryptjs`
  - `[v0] Password verification successful`
  - `[v0] JWT token created`

#### ❌ Error Cases
- [ ] **Wrong password**: Use incorrect password
- [ ] **Wrong email**: Use non-existent email
- [ ] **Wrong role**: Select different role than registered
- [ ] **Empty fields**: Submit with missing credentials

### 3. Session Management Testing

#### ✅ Session Persistence
- [ ] Login successfully
- [ ] Close browser tab
- [ ] Reopen application
- [ ] **Expected**: Still logged in, can access protected routes

#### ✅ Session Expiration
- [ ] Login successfully
- [ ] Wait for token expiration (or manually expire in dev tools)
- [ ] Try accessing protected route
- [ ] **Expected**: Redirect to login

#### ✅ Logout
- [ ] Login successfully
- [ ] Navigate to logout endpoint or trigger logout
- [ ] **Expected**: Session cleared, redirect to public page

### 4. Protected Routes Testing

#### ✅ Role-Based Access Control
- [ ] **Customer role**:
  - [ ] Can access customer dashboard
  - [ ] Cannot access admin routes
  - [ ] Cannot access merchant-specific features
- [ ] **Merchant role**:
  - [ ] Can access merchant dashboard
  - [ ] Cannot access admin routes
  - [ ] Can access merchant-specific features
- [ ] **Admin role**:
  - [ ] Can access all routes
  - [ ] Can access admin dashboard
  - [ ] Can manage users/system

#### ✅ Age Verification
- [ ] Register user under 21
- [ ] Try accessing age-restricted content
- [ ] **Expected**: Age verification prompt or access denied

---

## 🤖 Automated Testing Suggestions

### Unit Tests
\`\`\`javascript
// Test crypto utilities
describe('Crypto Utils', () => {
  test('hashPassword creates valid bcrypt hash', async () => {
    const password = 'testpass123';
    const hash = await hashPassword(password);
    expect(hash).toMatch(/^\$2[aby]\$\d+\$/);
  });

  test('verifyPassword validates correct password', async () => {
    const password = 'testpass123';
    const hash = await hashPassword(password);
    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });
});
\`\`\`

### Integration Tests
\`\`\`javascript
// Test registration API
describe('POST /api/auth/register', () => {
  test('creates user with valid data', async () => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'SecurePass123!',
        role: 'customer',
        age: 25
      })
    });
    expect(response.status).toBe(201);
  });
});
\`\`\`

### End-to-End Tests
\`\`\`javascript
// Test complete auth flow
describe('Authentication Flow', () => {
  test('register → login → access protected route', async () => {
    // 1. Register user
    await registerUser(testData);
    
    // 2. Login with credentials
    await loginUser(testData);
    
    // 3. Access protected route
    const protectedResponse = await accessProtectedRoute();
    expect(protectedResponse.status).toBe(200);
  });
});
\`\`\`

---

## 🔍 Database Validation

### Check User Creation
\`\`\`sql
-- Verify user was created with hashed password
SELECT id, email, role, age, created_at, 
       LENGTH(password_hash) as hash_length,
       SUBSTRING(password_hash, 1, 7) as hash_prefix
FROM users 
WHERE email = 'test@example.com';
\`\`\`

### Check Session Storage
\`\`\`sql
-- If using database sessions
SELECT user_id, expires_at, created_at
FROM user_sessions 
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
\`\`\`

---

## 🚨 Critical Success Criteria

### ✅ Registration Must Work
- [ ] No 500 errors during registration
- [ ] Password properly hashed with bcryptjs
- [ ] User data stored in database
- [ ] No CDN/MIME type errors in logs

### ✅ Login Must Work
- [ ] Password verification succeeds
- [ ] JWT token created and set as HTTP-only cookie
- [ ] Proper role-based redirects
- [ ] Session persists across browser sessions

### ✅ Security Must Be Enforced
- [ ] Protected routes require authentication
- [ ] Role-based access control works
- [ ] Age verification enforced where required
- [ ] Passwords never stored in plain text

---

## 🐛 Debugging Checklist

If tests fail, check these common issues:

### Registration Failures
- [ ] Check browser network tab for 500 errors
- [ ] Look for CDN/MIME type errors in server logs
- [ ] Verify bcryptjs is bundled locally (not from CDN)
- [ ] Check database connection and table schema

### Login Failures
- [ ] Verify password hash format in database
- [ ] Check JWT secret is set in environment variables
- [ ] Confirm cookie settings (httpOnly, secure, sameSite)
- [ ] Test password comparison with known good hash

### Route Protection Failures
- [ ] Check middleware is running on protected routes
- [ ] Verify JWT token parsing and validation
- [ ] Confirm role extraction from token payload
- [ ] Test cookie transmission in requests

---

## 📊 Success Metrics

**🎯 Target**: 100% pass rate on all critical success criteria

**📈 Performance**: Registration/login should complete in <2 seconds

**🔒 Security**: Zero plain-text passwords, all routes properly protected

**🧪 Coverage**: All user roles and edge cases tested

---

Once this test plan passes completely, you'll have confidence that your authentication foundation is production-ready for compliance module development.
