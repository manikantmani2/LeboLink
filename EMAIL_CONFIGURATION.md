# Email Configuration Guide for LeboLink

## Overview

LeboLink now uses **NodeMailer** for sending OTP verification codes via email. This replaces the previous SMS-based system (Twilio) with a more cost-effective and universally accessible email verification approach.

## Architecture Changes

### Previous System (Removed)
- **Provider**: Twilio SMS
- **Method**: Phone-based OTP delivered via SMS
- **Cost**: ~₹0.50-1 per SMS
- **Issues**: International phone number limitations, higher costs

### Current System
- **Provider**: NodeMailer (SMTP-based)
- **Method**: Email-based OTP delivered via email
- **Cost**: Free to minimal (depends on SMTP provider)
- **Benefits**: Universal, reliable, better user experience

## SMTP Configuration

### Environment Variables Required

Add these variables to your hosting platform (Railway, Heroku, etc.):

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@lebolink.com
SMTP_SECURE=false  # true for port 465, false for port 587
NODE_ENV=production
```

## SMTP Provider Options

### 1. **Gmail (Free & Simple)**

**Recommended for development and small deployments**

**Setup Steps:**
1. Enable 2-Factor Authentication on your Google Account
2. Generate an [App Password](https://support.google.com/accounts/answer/185833)
3. Use the 16-character password as `SMTP_PASSWORD`

**Configuration:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM=your-email@gmail.com
SMTP_SECURE=false
```

**Limits:** 500 emails/day via App Password

---

### 2. **SendGrid (Free Tier Available)**

**Good for production with daily email limits**

**Setup Steps:**
1. Create account at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Use `apikey` as username and API key as password

**Configuration:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
SMTP_SECURE=false
```

**Limits:** 100 emails/day free tier

---

### 3. **Mailgun (Excellent for Production)**

**Professional solution with great delivery rates**

**Setup Steps:**
1. Create account at [mailgun.com](https://www.mailgun.com)
2. Add verified domain
3. Get SMTP credentials from dashboard

**Configuration:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
SMTP_FROM=noreply@your-domain.mailgun.org
SMTP_SECURE=false
```

**Limits:** 5,000 emails/month free tier

---

### 4. **AWS SES (Amazon Simple Email Service)**

**Best for high-volume production use**

**Setup Steps:**
1. Create AWS account and enable SES
2. Verify your domain
3. Create SMTP credentials in SES console

**Configuration:**
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@verified-domain.com
SMTP_SECURE=false
```

**Limits:** 50,000 emails/day free tier (after verification)

---

### 5. **Resend (Modern Alternative)**

**Best developer experience, built for notifications**

**Setup Steps:**
1. Create account at [resend.com](https://resend.com)
2. Create API key in dashboard

**Configuration:**
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASSWORD=your-resend-api-key
SMTP_FROM=onboarding@resend.dev  # or your verified domain
SMTP_SECURE=true
```

**Limits:** 100 emails/day free tier

---

## Railway Deployment Configuration

### Steps to Add Environment Variables on Railway:

1. Go to your Railway project dashboard
2. Select the `lebolink-api` service
3. Click "Variables" tab
4. Add the SMTP configuration variables:

```
SMTP_HOST: smtp.gmail.com
SMTP_PORT: 587
SMTP_USER: your-email@gmail.com
SMTP_PASSWORD: your-app-password
SMTP_FROM: noreply@lebolink.com
SMTP_SECURE: false
```

5. Save and redeploy the service

### Testing Configuration on Railway:

```bash
# SSH into Railway container
railway shell

# Test SMTP connection
echo "Testing email configuration..."
curl -X POST http://localhost:3001/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## API Endpoints Using Email OTP

### 1. **Send OTP**
```http
POST /api/v1/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "email": "user@example.com",
  "devCode": "123456"  // Only in development
}
```

### 2. **Verify OTP**
```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "success": true,
  "email": "user@example.com",
  "userId": "...",
  "hasProfile": false,
  ...
}
```

### 3. **User Login with Password**
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 4. **Admin Login**
```http
POST /api/v1/auth/admin-login
Content-Type: application/json

{
  "email": "admin@lebolink.com",
  "password": "admin-password"
}

Response: Triggers verification email with OTP
```

### 5. **Admin Verify OTP**
```http
POST /api/v1/auth/admin-verify-otp
Content-Type: application/json

{
  "email": "admin@lebolink.com",
  "otp": "123456"
}

Response:
{
  "success": true,
  "email": "admin@lebolink.com",
  "userId": "...",
  "role": "admin",
  "token": "..."
}
```

## Frontend Changes

### Login Page (`apps/web/app/login/page.tsx`)
- Changed from phone number input to email input
- Updated OTP placeholder text to show email
- API calls now use `email` parameter instead of `phone`

### Admin Login Page (`apps/web/app/admin-login/page.tsx`)
- Changed from phone/admin-id input to email input
- Updated form submission to use email + password only
- Verification code sent to email (not SMS)

### Signup Page (`apps/web/app/signup/page.tsx`)
- Changed from phone verification to email verification
- Initial step now asks for email address
- Sends OTP to email for account creation

## Default Admin Credentials

**For Development/Testing:**
- Email: `admin@lebolink.com`
- Password: `Hello@&1234`

These credentials are seeded automatically on application startup.

## Testing Email OTP Locally

### 1. Using Mailtrap (Recommended for Development)

```env
SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=585
SMTP_USER=api
SMTP_PASSWORD=your-mailtrap-token
SMTP_FROM=your-email@mailtrap.io
SMTP_SECURE=true
```

All emails will be captured in Mailtrap inbox without sending actual emails.

### 2. Console Logging (Development)

In development mode (`NODE_ENV !== 'production'`), OTP codes are logged to console:

```
[DEV] OTP for user@example.com: 123456
```

## Troubleshooting

### "Failed to send OTP"
- **Check**: SMTP credentials are correct
- **Check**: Firewall allows outbound connections to SMTP port
- **Check**: Email provider account is active and not rate-limited
- **Action**: Try a different SMTP provider

### Email Not Arriving
- **Check**: Verify email address is correct
- **Check**: Check spam/junk folder
- **Check**: Verify domain ownership (if using custom domain)
- **Action**: Test with a different email provider

### Authentication Failed
- **Gmail**: Ensure App Password (not account password) is used
- **SendGrid**: Ensure username is `apikey`
- **AWS SES**: Verify account is out of sandbox mode

### Rate Limiting
- **Solution**: Use enterprise SMTP provider
- **Alternative**: Implement OTP caching to prevent resends within time window

## Production Best Practices

1. **Use dedicated SMTP provider** (SendGrid, Mailgun, AWS SES)
2. **Set up domain authentication** (DKIM, SPF, DMARC)
3. **Monitor email delivery rates**
4. **Implement rate limiting** on OTP requests
5. **Add OTP code expiration** (currently 15 minutes)
6. **Log all email delivery** for compliance

## Security Considerations

1. **OTP Expiration**: 15 minutes (configurable in auth.service.ts)
2. **OTP Code**: 6-digit random code
3. **Email Storage**: Store hashed passwords, OTP is temporary
4. **Rate Limiting**: Prevent brute force OTP attempts
5. **SMTP Credentials**: Use environment variables, never commit credentials

## Migration from SMS to Email

### What Changed:
- Removed Twilio dependency
- Added NodeMailer dependency
- Changed authentication flow from phone → email
- Admin login now requires email + password

### What Stayed Same:
- OTP verification logic
- Authentication token generation
- User account creation process
- Admin panel functionality

### For Existing Users:
- Existing phone-based user accounts remain but cannot login with SMS OTP
- Users must use email + password login or re-register with email
- Admin must be logged in with email (old phone-based access removed)

## Version History

- **v1.0**: Initial email OTP implementation with NodeMailer
- **v0.2**: Twilio SMS integration (now deprecated)
- **v0.1**: In-memory OTP store (now deprecated)
