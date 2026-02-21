# Supabase Configuration for FleetFlow MVP

## Email Confirmation Settings (IMPORTANT FOR MVP)

### Disable Email Confirmation Requirement
For the MVP, users should be able to sign up and immediately access the app without email verification.

#### Steps to Configure:

1. **Go to Supabase Dashboard**
   - Navigate to your FleetFlow project
   - Go to Authentication → Providers → Email

2. **Update Email Settings**
   - Find "Confirm email" toggle
   - **Set to**: DISABLED (or OFF)
   - This allows users to sign up without needing to verify their email

3. **Update Auth Settings**
   - Go to Authentication → Settings
   - Under "User Management"
   - Disable "Enable email verification"

#### What This Does:
- Users can sign up with email/password
- No confirmation email is sent
- Users are immediately logged in after signup
- Users can access the dashboard without email verification

#### Why for MVP:
- Faster onboarding flow
- Better user experience for testing
- Reduced friction for signup
- Can be enabled later in production with email service

## JWT Configuration

The default JWT configuration in Supabase should work fine. Key settings:

- **JWT Expiry**: 3600 seconds (1 hour)
- **Refresh Token**: 604800 seconds (7 days)
- **JWT Secret**: Auto-generated (keep secure)

These are configured in the middleware and Supabase client setup.

## Row Level Security (RLS)

All tables have RLS enabled with policies for:
- **Admin**: Full access to all data
- **Manager**: Access to their assigned vehicles and drivers
- **Driver**: Access only to their assigned vehicles and trips

## User Metadata Configuration

The auth system stores user metadata for:
- `first_name`: User's first name
- `last_name`: User's last name
- `role`: User role (admin, manager, driver)

This metadata is set during signup in the `options.data` field.

## Profile Trigger

A database trigger automatically creates a profile record for each new user:
- Copies user data from `auth.users` to `public.profiles`
- Sets default role from user metadata
- Maintains referential integrity

## Testing the Auth Flow

### Test Signup:
1. Go to http://localhost:3000/auth/sign-up
2. Fill in details with role selection
3. Click "Create Account"
4. Should redirect to /dashboard (no email confirmation)

### Test Login:
1. Go to http://localhost:3000/auth/login
2. Enter email and password from signup
3. Click "Sign In"
4. Should redirect to /dashboard

### Test RLS:
- Admin users: Can see all data
- Manager users: Can manage their team's data
- Driver users: Can only see their own assignments

## Environment Variables Required

Make sure these are set in your Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

These are automatically configured by the Supabase integration in v0.

## Monitoring & Logs

Monitor authentication in Supabase:
- Authentication → Auth Logs
- Check for failed login attempts
- Monitor user registration flow

## Security Considerations

Even with email confirmation disabled:
- All passwords are hashed with bcrypt
- API requests require valid JWT token
- RLS policies protect data at database level
- Session tokens have expiry times

For production, consider:
- Enabling email confirmation for real users
- Adding CAPTCHA to signup form
- Implementing rate limiting
- Email verification after certain time
- Phone number verification option

## Troubleshooting

### Users can't sign up:
- Check NEXT_PUBLIC_SUPABASE_URL is correct
- Check NEXT_PUBLIC_SUPABASE_ANON_KEY is valid
- Check email confirmation is disabled
- Check browser console for errors

### Users can't login:
- Check user exists in auth.users table
- Check profile exists in profiles table
- Check RLS policies allow access
- Check JWT token is valid

### Data not visible to users:
- Check RLS policies are correct
- Check user ID is in data ownership field
- Check role-based policies match user role
- Check database trigger created profile

## Next Steps (Post-MVP)

1. Enable email verification for production
2. Add password reset functionality
3. Implement MFA (Multi-Factor Authentication)
4. Add API rate limiting
5. Set up email templates
6. Configure webhook for user events
7. Add audit logging
