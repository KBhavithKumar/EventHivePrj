# EventHive Test Credentials

## Test User Accounts

### Admin Account
- **Email:** admin@gmail.com
- **Password:** AdminPass123
- **User Type:** ADMIN
- **Access:** Full system administration, manage organizations, events, users

### Organization Account
- **Email:** org@gmail.com
- **Password:** OrgPass123
- **User Type:** ORGANIZATION
- **Access:** Create and manage events, view participants, send notifications

### Regular User Account 1
- **Email:** testuser@gmail.com
- **Password:** TestPass123
- **User Type:** USER
- **Access:** Browse events, register for events, view notifications

### Regular User Account 2
- **Email:** test@example.com
- **Password:** TestPass123
- **User Type:** USER
- **Access:** Browse events, register for events, view notifications

## Login Instructions

1. Navigate to the login page: `http://localhost:5173/signin`
2. Select the appropriate user type from the dropdown
3. Enter the email and password from above
4. Click "Sign In"

## API Testing with cURL

### Admin Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gmail.com",
    "password": "AdminPass123",
    "userType": "ADMIN"
  }'
```

### Organization Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "org@gmail.com",
    "password": "OrgPass123",
    "userType": "ORGANIZATION"
  }'
```

### User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@gmail.com",
    "password": "TestPass123",
    "userType": "USER"
  }'
```

## PowerShell Testing (Windows)

### Admin Login
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@gmail.com","password":"AdminPass123","userType":"ADMIN"}'
```

### Organization Login
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"org@gmail.com","password":"OrgPass123","userType":"ORGANIZATION"}'
```

### User Login
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"testuser@gmail.com","password":"TestPass123","userType":"USER"}'
```

## Dashboard Access URLs

### Admin Dashboard
- URL: `http://localhost:5173/admin/dashboard`
- Features: Organizations management, events approval, user management

### Organization Dashboard
- URL: `http://localhost:5173/organization/dashboard`
- Features: Event creation, participant management, notifications

### User Dashboard
- URL: `http://localhost:5173/user/dashboard`
- Features: Event browsing, registration management, notifications

## Public Pages (No Login Required)

### Browse Events
- URL: `http://localhost:5173/events`
- Features: Search events, filter by category/status/date

### Notifications
- URL: `http://localhost:5173/notifications`
- Features: View public notifications, search and filter

### Home Page
- URL: `http://localhost:5173/`
- Features: Featured events, quick navigation

## Sample Data

The system includes sample data for:
- 5 test events with different categories and statuses
- 10 sample notifications
- Test users with different roles

## Notes

1. All passwords follow the pattern: `[Role]Pass123`
2. Email validation is enabled for Gmail addresses
3. JWT tokens are used for authentication
4. Session management is handled automatically
5. All test accounts are pre-verified and active

## Troubleshooting

If login fails:
1. Ensure the backend server is running on port 5000
2. Check that the database is connected
3. Verify the test users were created successfully
4. Check browser console for error messages
5. Ensure CORS is properly configured

## Security Notes

- These are test credentials for development only
- Do not use these credentials in production
- Change all passwords before deploying to production
- Implement proper email verification in production
