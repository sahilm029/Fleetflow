-- Disable email confirmation requirement for MVP
-- This allows users to sign up and immediately access the app

-- Note: This needs to be run in the Supabase dashboard under Auth settings
-- Email Confirmations should be set to "Disabled" 
-- The endpoint /auth/callback is only needed if email confirmations are enabled

-- Alternative: Manually sign up users in auth.users table bypassing email verification
-- The UI will handle this flow through the signup endpoint

-- For development: Users are created directly in auth.users without confirmation requirement
