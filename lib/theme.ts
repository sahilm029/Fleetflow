// FleetFlow Theme Configuration
// Modern fleet management system with premium, professional colors

export const fleetTheme = {
  // Primary Colors - Deep Blue for trust and professionalism
  primary: {
    50: '#f0f4f9',
    100: '#e0e9f4',
    200: '#c1d3e8',
    300: '#a3bddd',
    400: '#3b82f6', // Main primary
    500: '#0066ff',
    600: '#0052cc',
    700: '#003d99',
    800: '#002966',
    900: '#001433',
  },

  // Accent Colors - Vibrant Green for action and success
  accent: {
    50: '#f0fdf5',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#22c55e', // Main accent
    500: '#16a34a',
    600: '#15803d',
    700: '#166534',
    800: '#14532d',
    900: '#0f3818',
  },

  // Secondary Colors - Amber for alerts and warnings
  secondary: {
    50: '#fefce8',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#eab308', // Main secondary
    500: '#ca8a04',
    600: '#a16207',
    700: '#854d0e',
    800: '#713f12',
    900: '#5f2e0f',
  },

  // Neutral Colors - Sleek Grays for UI
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Dark variant for better contrast
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#64748b',
    500: '#475569',
    600: '#334155',
    700: '#1e293b',
    800: '#0f172a',
    900: '#020617',
  },

  // Semantic colors
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#0066ff',

  // Gradients for visual depth
  gradients: {
    // Primary gradient for headers and hero sections
    primary: 'linear-gradient(135deg, #0066ff 0%, #00a8ff 100%)',
    // Accent gradient for buttons
    accent: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    // Subtle background gradient
    subtle: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
    // Dark gradient for overlays
    dark: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
  },

  // Shadows for depth
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.15)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
    // Glow effect for interactive elements
    glow: '0 0 20px rgba(0, 102, 255, 0.3)',
  },

  // Typography
  fonts: {
    sans: ['Geist', 'system-ui', 'sans-serif'],
    mono: ['Geist Mono', 'monospace'],
  },

  // Spacing scale
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
  },

  // Border radius
  radius: {
    sm: '0.375rem',
    md: '0.625rem',
    lg: '0.875rem',
    xl: '1rem',
    full: '9999px',
  },

  // Animation timings
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
}

export type Theme = typeof fleetTheme
