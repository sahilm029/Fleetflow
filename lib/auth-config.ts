// Authentication Configuration for FleetFlow
// MVP Configuration - No email confirmation required

export const AUTH_CONFIG = {
  // Email confirmation disabled for MVP
  // Users can immediately access the app after signup
  emailConfirmationRequired: false,

  // Redirect URLs
  redirectUrls: {
    afterLogin: '/dashboard',
    afterSignup: '/dashboard', // Changed from sign-up-success for MVP
    onError: '/auth/error',
  },

  // Password requirements
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },

  // Session configuration
  session: {
    expiryTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    refreshThreshold: 1000 * 60 * 60, // Refresh 1 hour before expiry
  },

  // Role definitions
  roles: {
    admin: 'admin',
    manager: 'manager',
    driver: 'driver',
  },

  // Role permissions
  rolePermissions: {
    admin: ['view_all', 'create', 'edit', 'delete', 'manage_users', 'view_analytics'],
    manager: [
      'view_all',
      'create',
      'edit',
      'view_analytics',
      'manage_drivers',
      'manage_vehicles',
    ],
    driver: ['view_own', 'edit_own'],
  },
}

export type UserRole = keyof typeof AUTH_CONFIG.roles
