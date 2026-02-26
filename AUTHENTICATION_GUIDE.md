# Authentication & Authorization Guide

## Overview

The API now includes complete authentication support with:
-  User signup with password hashing
-  User login with JWT token generation
- Token refresh mechanism
- Protected endpoints (optional)

---

## Authentication Flow

### 1. User Signup (Registration)

**Endpoint:** `POST /api/users/auth/signup/`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "SecurePass123",
  "password_confirm": "SecurePass123"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user_id": "1",
  "email": "john@example.com",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGci..."
}
```

**Validation Rules:**
- `name` - Required, max 100 characters
- `email` - Valid email format, must be unique
- `phone` - Required, max 20 characters
- `password` - Minimum 8 characters, must match password_confirm
- `password_confirm` - Must match password

**HTTP Status Codes:**
- `201 Created` - User successfully registered
- `400 Bad Request` - Invalid data or email already exists
- `500 Internal Server Error` - Server error

---

### 2. User Login

**Endpoint:** `POST /api/users/auth/login/`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user_id": "1",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGci..."
}
```

**Validation:**
- Password is validated against database
- Case-sensitive email lookup
- Returns user profile data on success

**HTTP Status Codes:**
- `200 OK` - Successfully logged in
- `400 Bad Request` - Invalid credentials
- `401 Unauthorized` - Authentication failed

---

### 3. Token Refresh

**Endpoint:** `POST /api/users/auth/refresh_token/`

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGci..."
}
```

**Response (200 OK):**
```json
{
  "message": "Token refreshed successfully",
  "access": "eyJ0eXAiOiJKV1QiLCJhbGci..."
}
```

**When to Use:**
- Access token expires (60 minutes)
- Need to get new access token without re-logging in
- Keep user loggedIn for extended sessions

**HTTP Status Codes:**
- `200 OK` - Token successfully refreshed
- `400 Bad Request` - Invalid or expired refresh token

---

## JWT Tokens

### Access Token
- **Lifespan:** 60 minutes
- **Used for:** API request authentication
- **Header:** `Authorization: Bearer <access_token>`

### Refresh Token
- **Lifespan:** 7 days
- **Used for:** Getting new access tokens
- **Storage:** Secure localStorage (browser) or secure storage (mobile)

### Token Format
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "token_type": "access",
  "exp": 1740510000,
  "iat": 1740506400,
  "jti": "...",
  "user_id": 1
}

Signature: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)
```

---

## Using Access Tokens

### With Retrieved Token
After login, use the `access` token in API requests:

```bash
curl -X GET http://localhost:8000/api/user/wallet?user_id=1 \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci..."
```

### With cURL
```bash
# Get the token first
TOKEN=$(curl -X POST http://localhost:8000/api/users/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123"}' \
  | jq -r '.access')

# Use token in requests
curl -X GET http://localhost:8000/api/user/wallet?user_id=1 \
  -H "Authorization: Bearer $TOKEN"
```

### With JavaScript/Fetch
```javascript
// Login
const response = await fetch('http://localhost:8000/api/users/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123'
  })
});

const data = await response.json();
const accessToken = data.access;

// Use token
const walletResponse = await fetch('http://localhost:8000/api/user/wallet?user_id=1', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### With Postman
1. Go to **Authorization** tab
2. Select **Bearer Token**
3. Paste your access token

---

## Database Storage

When a user signs up, the following data is stored:

### User Table
```
username: (email)
email: john@example.com
password: (hashed)
is_active: true
date_joined: 2026-02-25T10:00:00Z
```

### UserProfile Table
```
user_id: 1
name: John Doe
email: john@example.com
phone: 1234567890
national_id: (empty)
```

### Wallet Table
```
user_id: 1
wallet_balance: 0.00
```

---

## Complete Workflow Example

### Step 1: User Signs Up
```bash
curl -X POST http://localhost:8000/api/users/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "5556667777",
    "password": "MySecurePass123",
    "password_confirm": "MySecurePass123"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user_id": "2",
  "email": "jane@example.com",
  "access": "abc123...",
  "refresh": "xyz789..."
}
```

### Step 2: User Logs In
```bash
curl -X POST http://localhost:8000/api/users/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "MySecurePass123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "user_id": "2",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "5556667777",
  "access": "new_access_token...",
  "refresh": "new_refresh_token..."
}
```

### Step 3: User Performs Actions
```bash
# Add Vehicle
curl -X POST http://localhost:8000/api/user/car \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer new_access_token..." \
  -d '{
    "user_id": 2,
    "license_plate": "JANE-001",
    "model": "Tesla Model S",
    "color": "White",
    "vehicle_type": "car"
  }'

# Add Funds to Wallet
curl -X POST http://localhost:8000/api/user/wallet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer new_access_token..." \
  -d '{
    "user_id": 2,
    "amount": 100.00
  }'

# Capture Toll
curl -X POST http://localhost:8000/api/capture/GATE01 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer new_access_token..." \
  -d '{
    "license_plate": "JANE-001"
  }'
```

### Step 4: Token Expires (After 60 minutes)
```bash
curl -X POST http://localhost:8000/api/users/auth/refresh_token/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "new_refresh_token..."
  }'
```

**Response:**
```json
{
  "message": "Token refreshed successfully",
  "access": "fresh_access_token..."
}
```

---

## Database Credentials Validation Flow

```
┌─────────────────────────────────────────────────────┐
│         User Login Request                          │
│  {email: "john@example.com", password: "pass123"}   │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│  Check User Exists by Email in User Table           │
│  SELECT * FROM users WHERE email = ?                │
└──────────────┬──────────────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
      ✓ │             │ ✗
        │             │
        ▼             ▼
    Found     Not Found
        │             │
        │          Return 400
        │          Error
        │
        ▼
┌─────────────────────────────────────────────────────┐
│  Verify Password with check_password()              │
│  (Uses bcrypt comparison)                           │
└──────────────┬──────────────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
      ✓ │             │ ✗
        │             │
        ▼             ▼
    Match      No Match
        │       Return 400
        │       Error
        ▼
┌─────────────────────────────────────────────────────┐
│  Generate JWT Tokens                                │
│  - AccessToken (1 hour)                             │
│  - RefreshToken (7 days)                            │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│  Return 200 OK with Tokens & User Data              │
│  {access, refresh, user_id, name, email, phone}     │
└─────────────────────────────────────────────────────┘
```

---



## Error Handling

### Signup Errors

| Error | Status | Cause |
|-------|--------|-------|
| Passwords must match | 400 | password != password_confirm |
| Email already registered | 400 | Email exists in DB |
| Invalid email format | 400 | Email validation failed |
| Password too short | 400 | password < 8 characters |

### Login Errors

| Error | Status | Cause |
|-------|--------|-------|
| Invalid email or password | 400 | User not found |
| Invalid email or password | 400 | Password doesn't match |

### Token Errors

| Error | Status | Cause |
|-------|--------|-------|
| Refresh token is required | 400 | No refresh token provided |
| Invalid refresh token | 400 | Token expired or invalid |

---

## Testing Authentication

### Using test_api.py
The test suite includes authentication tests:
```bash
python test_api.py
```

### Manual Testing with cURL
```bash
# 1. Signup
curl -X POST http://localhost:8000/api/users/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "TestPass123",
    "password_confirm": "TestPass123"
  }'

# 2. Login
curl -X POST http://localhost:8000/api/users/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# 3. Refresh Token
curl -X POST http://localhost:8000/api/users/auth/refresh_token/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "your_refresh_token"}'
```

---

## Configuration

### Settings in `autofare/settings.py`
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),  # 1 hour
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),     # 7 days
    'ROTATE_REFRESH_TOKENS': False,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}
```


- [ ] Rate limiting on login attempts
- [ ] OAuth 2.0 support
