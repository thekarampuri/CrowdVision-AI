# Light Mode Fix - Complete Guide

## What Was Fixed

I've updated the following components to be theme-aware and work properly in both dark and light modes:

### Components Fixed ✅

1. **webcam-feed.tsx** - Camera feed component
2. **stats-card.tsx** - Statistics cards
3. **heatmap-view.tsx** - Heatmap visualization

### Color Replacements Made

| Old (Dark Only) | New (Theme-Aware) | Purpose |
|----------------|-------------------|---------|
| `text-white` | `text-foreground` | Main text color |
| `text-slate-400` | `text-muted-foreground` | Secondary text |
| `text-slate-500` | `text-muted-foreground` | Tertiary text |
| `text-slate-600` | `text-muted-foreground` | Muted text |
| `bg-slate-900` | `bg-muted` | Background color |
| `bg-black` | `bg-background` | Base background |

## Theme-Aware Classes Reference

Use these Tailwind classes for automatic light/dark mode support:

### Text Colors
- `text-foreground` - Primary text (white in dark, dark in light)
- `text-muted-foreground` - Secondary text (gray-400 in dark, gray-600 in light)
- `text-card-foreground` - Card text
- `text-popover-foreground` - Popover text

### Background Colors
- `bg-background` - Main background
- `bg-muted` - Muted background
- `bg-card` - Card background
- `bg-popover` - Popover background

### Border Colors
- `border-border` - Standard border
- `border-input` - Input border

### Accent Colors
- `bg-primary` / `text-primary` - Primary brand color
- `bg-secondary` / `text-secondary` - Secondary brand color
- `bg-accent` / `text-accent` - Accent color
- `bg-destructive` / `text-destructive` - Destructive/error color

## Remaining Pages to Fix

The following pages still have hardcoded dark colors and need updating:

### Dashboard Pages

1. **app/dashboard/page.tsx** - Main dashboard
   - Lines 41, 51-56, 105, 115-146
   - Replace `text-white`, `text-slate-*` with theme classes

2. **app/dashboard/settings/page.tsx** - Settings page
   - Lines 129-195
   - Replace hardcoded colors

3. **app/dashboard/reports/page.tsx** - Reports page
   - Lines 101-218
   - Replace hardcoded colors

4. **app/dashboard/alerts/page.tsx** - Alerts page
5. **app/dashboard/analytics/page.tsx** - Analytics page
6. **app/dashboard/cameras/page.tsx** - Cameras page
7. **app/dashboard/history/page.tsx** - History page

### How to Fix Remaining Pages

For each page, replace:

```tsx
// ❌ Old (Dark only)
<h1 className="text-white">Title</h1>
<p className="text-slate-400">Description</p>
<div className="bg-slate-900">Content</div>

// ✅ New (Theme-aware)
<h1 className="text-foreground">Title</h1>
<p className="text-muted-foreground">Description</p>
<div className="bg-muted">Content</div>
```

## Quick Fix Script

You can use this find-and-replace pattern in your editor:

1. Find: `text-white` → Replace: `text-foreground`
2. Find: `text-slate-400` → Replace: `text-muted-foreground`
3. Find: `text-slate-500` → Replace: `text-muted-foreground`
4. Find: `text-slate-600` → Replace: `text-muted-foreground/70`
5. Find: `bg-slate-900` → Replace: `bg-muted`

**Note**: Be careful with:
- Gradient colors (keep as-is)
- Status indicators (green, red, yellow - keep as-is)
- Brand colors (blue, cyan - keep as-is)
- Overlays with opacity (`bg-black/50` - keep as-is)

## Testing Light Mode

1. **Toggle Theme**: Use the theme switcher in your app
2. **Check Contrast**: Ensure text is readable in both modes
3. **Verify Components**: Check all fixed components work properly

### Expected Behavior

**Dark Mode**:
- `text-foreground` → White text
- `text-muted-foreground` → Gray-400 text
- `bg-muted` → Dark gray background

**Light Mode**:
- `text-foreground` → Dark text
- `text-muted-foreground` → Gray-600 text
- `bg-muted` → Light gray background

## Custom Components

For custom components that need specific light/dark behavior:

```tsx
// Using dark: variant
<div className="bg-white dark:bg-slate-900">
  <p className="text-gray-900 dark:text-white">Text</p>
</div>

// Using theme variables
<div className="bg-background text-foreground">
  Content
</div>
```

## Glass Morphism in Light Mode

The `.glass` and `.glass-strong` utilities are already theme-aware:

**Dark Mode**:
```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Light Mode**:
```css
.light .glass {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
```

## Common Patterns

### Card Component
```tsx
<div className="glass-strong rounded-xl p-4">
  <h3 className="text-foreground font-semibold">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### Stat Display
```tsx
<div className="space-y-1">
  <span className="text-muted-foreground text-sm">Label</span>
  <div className="text-foreground text-2xl font-bold">Value</div>
</div>
```

### Button States
```tsx
<button className="text-muted-foreground hover:text-foreground">
  Click me
</button>
```

## Next Steps

1. ✅ Core components fixed (webcam-feed, stats-card, heatmap-view)
2. ⏭️ Fix remaining dashboard pages
3. ⏭️ Test all pages in light mode
4. ⏭️ Verify accessibility (contrast ratios)

## Need Help?

If you encounter any issues:
1. Check the color is using a theme variable
2. Verify the component re-renders on theme change
3. Test in both light and dark modes
4. Check browser console for errors

The theme system is defined in `app/globals.css` with CSS variables that automatically switch based on the `.light` or `.dark` class on the root element.
