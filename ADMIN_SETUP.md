# Admin Access Setup Guide

This guide explains how to grant administrator privileges to users in the Growth application.

## Prerequisites

- A registered user account in the system
- Access to the Supabase SQL Editor

## Method 1: Using the Admin Panel (Recommended for existing admins)

If you already have admin access, you can grant admin privileges to other users through the web interface:

1. Log in to your admin account
2. Navigate to the Admin Dashboard
3. Click on "Grant Admin Access" at the bottom of the Quick Actions menu
4. Enter the user's email address
5. Click "Grant Admin Access"

## Method 2: SQL Editor (For initial setup)

If you're setting up the first admin user or need to use SQL directly:

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/tktjjxgxvzzvgnmeodqg/sql/new
2. Open the SQL Editor

### Step 2: Run the Admin Grant Query

Replace `user@example.com` with the actual user's email address:

```sql
-- Grant admin role to a user by email
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'user@example.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

### Step 3: Verify the Grant

Check if the user now has admin privileges:

```sql
-- Verify admin role
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'user@example.com';
```

## Method 3: Using the Admin Setup Page

Navigate to `/admin/make-admin` in your browser after logging in with an admin account.

## Security Best Practices

1. **Limit Admin Accounts**: Only grant admin privileges to trusted users
2. **Regular Audits**: Periodically review who has admin access
3. **Revoke When Needed**: Remove admin privileges when they're no longer needed
4. **Use Strong Passwords**: Ensure admin accounts use strong, unique passwords
5. **Enable 2FA**: Always enable two-factor authentication for admin accounts

## Revoking Admin Access

To remove admin privileges from a user:

```sql
-- Revoke admin role from a user
DELETE FROM public.user_roles
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
)
AND role = 'admin';
```

## Checking Current Admins

To see all users with admin privileges:

```sql
-- List all admins
SELECT 
  u.email,
  p.full_name,
  ur.created_at as admin_since
FROM public.user_roles ur
JOIN auth.users u ON ur.user_id = u.id
LEFT JOIN public.profiles p ON u.id = p.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;
```

## Troubleshooting

### "User not found" error
- Ensure the user has registered an account
- Verify the email address is correct
- Check that email verification is complete (if enabled)

### Admin panel not appearing
- Log out and log back in after granting admin privileges
- Clear browser cache and cookies
- Verify the role was correctly added to the database

### Permission denied errors
- Ensure RLS policies are correctly configured
- Check that the `has_role` function exists in the database
- Verify the user's session is valid

## Admin Panel Features

Once granted admin access, users can:
- View system statistics and health metrics
- Manage user accounts and roles
- Control liquidity pools
- Manage governance proposals
- Monitor transactions and system activity
- Grant admin access to other users

## Support

For additional help or issues with admin access, check the application logs or contact your system administrator.
