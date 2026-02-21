# FleetFlow Theme Usage Guide

## Quick Start

### Using Theme Values in Components

```tsx
import { fleetTheme } from '@/lib/theme'

export function MyComponent() {
  return (
    <div style={{ color: fleetTheme.primary[600] }}>
      Primary Text
    </div>
  )
}
```

### Using CSS Variables (Recommended)

Instead of importing the theme, use CSS variables directly:

```tsx
export function MyButton() {
  return (
    <button className="bg-primary text-primary-foreground">
      Click Me
    </button>
  )
}
```

CSS variables are available in all files and automatically sync with your theme.

## Available Colors

### Primary Colors (Blues)
```
--primary: #0066ff (Main brand color)
--primary-foreground: #ffffff (Text on primary)

Usage:
<button className="bg-primary text-primary-foreground">
  Action Button
</button>
```

### Accent Colors (Greens)
```
--accent: #22c55e (Success, positive actions)
--accent-foreground: #ffffff (Text on accent)

Usage:
<div className="bg-accent text-accent-foreground">
  Success State
</div>
```

### Secondary Colors (Ambers)
```
--secondary: #eab308 (Warnings, alerts)
--secondary-foreground: #111827 (Text on secondary)

Usage:
<div className="bg-secondary text-secondary-foreground">
  Alert Message
</div>
```

### Neutral Colors (Grays)
```
--background: #ffffff (Main background)
--foreground: #111827 (Primary text)
--muted: #f3f4f6 (Muted backgrounds)
--muted-foreground: #6b7280 (Muted text)
--border: #e5e7eb (Border color)

Usage:
<div className="bg-background text-foreground border border-border">
  Content
</div>
```

### Status Colors
```
--destructive: #ef4444 (Errors, delete)
--destructive-foreground: #ffffff (Text on destructive)

Usage:
<button className="bg-destructive text-destructive-foreground">
  Delete
</button>
```

## Gradients

### Primary Gradient (Blue)
```css
--gradient-primary: linear-gradient(135deg, #0066ff 0%, #00a8ff 100%)
```

Usage:
```tsx
<div className="bg-gradient-to-r from-blue-600 to-blue-500">
  Hero Section
</div>
```

### Accent Gradient (Green)
```css
--gradient-accent: linear-gradient(135deg, #22c55e 0%, #16a34a 100%)
```

### Background Gradient
```css
--gradient-subtle: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)
```

## Shadows

Predefined shadow scales:

```tsx
// Light shadow
<div className="shadow-sm">Light</div>

// Medium shadow
<div className="shadow-md">Medium</div>

// Large shadow
<div className="shadow-lg">Large</div>

// Glow effect
<div className="shadow-[0_0_20px_rgba(0,102,255,0.3)]">Glowing</div>
```

## Animations

### Entrance Animations
```tsx
// Slide up with fade
<div className="animate-slide-up">Content</div>

// Scale in
<div className="animate-scale-in">Card</div>

// Fade in
<div className="animate-fade-in">Text</div>
```

### Interactive Animations
```tsx
// Hover effect
<div className="hover:scale-105 transition-transform">
  Hover me
</div>

// Pulse glow
<div className="animate-pulse-glow">Highlight</div>

// Float effect
<div className="animate-float">Icon</div>
```

### Staggered Lists
```tsx
{items.map((item, index) => (
  <div 
    key={item.id}
    className={`animate-slide-up animate-stagger-${index + 1}`}
  >
    {item.name}
  </div>
))}
```

## Typography

### Font Families
```css
--font-sans: 'Geist', 'Geist Fallback'
--font-mono: 'Geist Mono', 'Geist Mono Fallback'
```

Usage:
```tsx
<p className="font-sans">Regular Text</p>
<code className="font-mono">Monospace</code>
```

### Text Styles
```tsx
// Large heading with gradient
<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
  Title
</h1>

// Muted secondary text
<p className="text-muted-foreground text-sm">
  Description
</p>

// Error text
<p className="text-destructive">Error message</p>
```

## Spacing

Used through Tailwind's standard scale:
```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 2.5rem (40px)
3xl: 3rem (48px)
```

Usage:
```tsx
<div className="p-md gap-lg">
  <Card className="mb-xl">Content</Card>
</div>
```

## Border Radius

```
sm: 0.375rem (6px)
md: 0.625rem (10px) - Default
lg: 0.875rem (14px)
xl: 1rem (16px)
full: 9999px (Pill shape)
```

Usage:
```tsx
<div className="rounded-md">Default radius</div>
<div className="rounded-lg">Larger radius</div>
<div className="rounded-full">Circle</div>
```

## Dark Mode

The theme automatically includes dark mode colors:

```tsx
// Light mode
<div className="bg-white text-slate-900">
  Light content
</div>

// Dark mode (automatic via dark class)
<div className="dark:bg-slate-900 dark:text-white">
  Respects system dark mode
</div>
```

Add `dark` class to html element to enable dark mode:
```tsx
// In /app/layout.tsx
<html className={darkMode ? 'dark' : ''}>
  {children}
</html>
```

## Component Examples

### Button Variants

```tsx
// Primary Button
<button className="bg-primary text-primary-foreground px-md py-sm rounded-md hover:opacity-90 transition-opacity">
  Primary
</button>

// Secondary Button
<button className="bg-secondary text-secondary-foreground px-md py-sm rounded-md hover:opacity-90 transition-opacity">
  Secondary
</button>

// Destructive Button
<button className="bg-destructive text-destructive-foreground px-md py-sm rounded-md hover:opacity-90 transition-opacity">
  Delete
</button>
```

### Card Component

```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg shadow-md p-lg">
  <h3 className="font-semibold text-lg mb-md">Title</h3>
  <p className="text-muted-foreground">Content</p>
</div>
```

### Input Field

```tsx
<input 
  className="bg-input border border-border rounded-md px-md py-sm text-foreground placeholder-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
  placeholder="Enter text..."
/>
```

## Transitioning Existing Components

### Before
```tsx
<div className="bg-white text-black border border-gray-300">
  Content
</div>
```

### After
```tsx
<div className="bg-background text-foreground border border-border">
  Content
</div>
```

This automatically respects light/dark modes and follows the theme system.

## Best Practices

1. **Use CSS Variables**: Prefer `bg-primary` over hardcoded colors
2. **Semantic Names**: Use `text-destructive` for errors, not `text-red-500`
3. **Consistent Spacing**: Use theme spacing scale, not arbitrary values
4. **Gradients**: Use predefined gradients for cohesive look
5. **Animations**: Add animations for entrance and interaction
6. **Accessibility**: Ensure sufficient color contrast (WCAG AA)
7. **Dark Mode**: Test all colors in dark mode

## Customization

To change theme colors globally:

1. Update `/app/globals.css` CSS variables
2. Update `/lib/theme.ts` TypeScript object
3. All components automatically update

Example - Change Primary Color to Purple:
```css
/* globals.css */
--primary: #9333ea;
--primary-foreground: #ffffff;
```

```ts
// theme.ts
primary: {
  600: '#9333ea',
  ...
}
```

## Troubleshooting

### Colors Not Applying
- Check CSS variable name matches (use hyphens, not camelCase)
- Ensure `globals.css` is imported in layout
- Dark mode might be overriding - check media query

### Animations Not Smooth
- Check performance in DevTools (should be 60fps)
- Ensure animations use `transform` and `opacity` (GPU accelerated)
- Check `prefers-reduced-motion` system setting

### Dark Mode Not Working
- Add `next-themes` provider to layout
- Use `next-themes` hook for dark mode toggle
- Ensure `dark` class is applied to html element

## Reference

- Theme config: `/lib/theme.ts`
- CSS variables: `/app/globals.css`
- Animation docs: `FLEET_ENHANCEMENTS.md`
- Full design guide: `FLEET_ENHANCEMENTS.md`
