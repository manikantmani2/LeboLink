# Authentication & Email Configuration

Note: Multi-factor authentication (OTP via SMS or email) has been **completely removed** from LeboLink. The application now uses simple password-based authentication (register/login with email or phone + password).

Email notifications are optional and not required for core functionality. If you want to enable email notifications for alerts or activity logs in the future, configure an SMTP provider and add the corresponding environment variables to your deployment platform.

Example SMTP variables (for optional notification emails only):

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@yourdomain.com
```

Set these in your hosting platform (Vercel Environment Variables, Render/Other host settings). **All OTP endpoints and Twilio/NodeMailer integrations have been removed from the codebase.**

## Frontend Authentication

### Login Page (`apps/web/app/login/page.tsx`)
- Email or phone number input
- Password input
- Simple password-based login flow

### Admin Login Page (`apps/web/app/admin-login/page.tsx`)
- Email input
- Password input
- Direct password-based authentication (no OTP)

### Signup Page (`apps/web/app/signup/page.tsx`)
- Name, email (optional), phone (optional), password
- Worker-specific fields (job category, hourly rate, location, availability)
- Direct registration without email verification

## Default Admin Credentials

**For Development/Testing:**
- Email: `admin@lebolink.com`
- Password: `Hello@&1234`

These credentials are seeded automatically on application startup. Change these in production!

## Testing Authentication Locally

### 1. Development Database
The application auto-seeds an admin user on startup:
- Email: `admin@lebolink.com`
- Password: `Hello@&1234`

### 2. Testing Login Flow
```bash
# Terminal 1: Start API
cd apps/api
npm run start

# Terminal 2: Start Web
cd apps/web
npm run dev

# Browser: http://localhost:3000
```

### 3. Manual Testing Checklist
- [ ] Register as customer with email + password
- [ ] Register as worker with job category and hourly rate
- [ ] Login as customer
- [ ] Login as worker
- [ ] Login as admin
- [ ] Verify user profile data is saved
- [ ] Verify worker approval status

## Troubleshooting

### Can't Login
- **Check**: Email or phone number is correct
- **Check**: Password is correct
- **Check**: Account is not blocked or deactivated by admin
- **Action**: Verify credentials in seeded admin account

### Registration Fails
- **Check**: Email or phone is provided (at least one)
- **Check**: Password meets requirements
- **Check**: Name is provided
- **Action**: Check API logs for error details

### Worker Profile Missing Fields
- **Check**: Worker required fields filled during signup (job category, hourly rate, location, availability)
- **Check**: Worker approval status (must be "approved" to show in listings)
- **Action**: Admin must approve worker profile

## Production Best Practices

1. **Use strong passwords** - enforce password strength requirements
2. **Enable HTTPS** - all communication must be encrypted
3. **Set secure environment variables** - never commit credentials
4. **Monitor authentication logs** - track login attempts and failures
5. **Implement account lockout** - prevent brute force attacks
6. **Regular backups** - protect user data in MongoDB
7. **Update dependencies regularly** - keep bcrypt and other libs current

## Security Considerations

1. **Password Hashing**: Passwords are hashed using bcrypt (10 salt rounds)
2. **Password Storage**: Never store plain-text passwords; use hashed versions only
3. **JWT Tokens**: Currently using placeholder tokens; update to real JWT in production
4. **HTTPS Required**: Always use HTTPS in production
5. **Environment Variables**: Store secrets in environment variables, never in code
6. **Rate Limiting**: Implement rate limiting on login endpoints (already enabled in NestJS ThrottlerGuard)

## Version History

- **v1.1**: Password-based authentication only; OTP/Twilio/NodeMailer removed
- **v1.0**: Email OTP integration (deprecated)
- **v0.2**: SMS OTP with Twilio (deprecated)
