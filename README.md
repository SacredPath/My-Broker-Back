# BACKOFFICE - Independent Admin System

This folder contains all admin/backoffice related files extracted from the main Savage-Broker project for independent development.

## Files Copied

### Frontend Pages
- **index.html** - PALANTIR Trading Platform Admin Dashboard
- **users.html** - User management page
- **audit.html** - Audit logs page  
- **settings.html** - Admin settings page

### JavaScript Controllers
- **index.js** - Dashboard functionality
- **users.js** - User management logic
- **audit.js** - Audit system logic
- **settings.js** - Settings management

### Styling
- **backoffice.css** - Admin panel styling

### Configuration
- **env.js** - Environment variables and Supabase configuration
- **explore_full_schema.sql** - Complete database schema exploration query

### Backend Functions
- **supabase/functions/** - All admin-related Supabase Edge Functions
  - **admin_verify_email/** - Email verification for admins
  - **bo_users_list/** - List users functionality
  - **users_create/** - Create new users
  - **users_update/** - Update existing users
  - **users_suspend/** - Suspend/unsuspend users
  - **users_stats/** - User statistics
  - **audit_list/** - Retrieve audit logs
  - **_shared/** - Shared utilities and helpers

## Setup Instructions

1. **Environment Configuration**
   - Update `env.js` with your Supabase project details
   - Ensure admin role permissions are configured

2. **Deploy Functions**
   - Deploy all functions in `supabase/functions/` to your Supabase project
   - Update function URLs in the JavaScript files if needed

3. **Frontend Setup**
   - Host the HTML/JS/CSS files on your preferred platform
   - Ensure CORS is properly configured for your domain

4. **Database Setup**
   - Ensure all required tables and triggers exist
   - Set up proper RBAC (Role-Based Access Control)
   - Use `explore_full_schema.sql` to explore the complete database structure

## Database Schema

The database schema is crucial for the proper functioning of the backoffice system. The `explore_full_schema.sql` file provides a comprehensive exploration of the database structure. Ensure that all required tables and triggers are created and properly configured.

## Features

- **User Management**: Create, update, suspend users
- **Audit System**: Track all admin actions
- **Settings**: Configure admin preferences
- **Dashboard**: Overview statistics and metrics
- **Email Verification**: Admin email verification system

## Security Notes

- All functions include proper authentication checks
- RBAC system ensures only authorized access
- Audit logging tracks all administrative actions
- Environment variables should be secured appropriately

## Independence

This backoffice system is designed to work independently:
- Uses copy of `env.js` for configuration
- All necessary functions and utilities included
- Can be deployed on separate domain/subdomain
- Shares the same Supabase database as main application

## Next Steps

1. Configure environment variables
2. Deploy Supabase functions
3. Set up hosting for frontend files
4. Test all admin functionalities
5. Configure proper domain and SSL
