# 🎨 TechThrive HRMS - Theme System Documentation

Complete guide to the theme system implementation in TechThrive HRMS application.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Available Themes](#available-themes)
3. [Architecture](#architecture)
4. [Implementation Details](#implementation-details)
5. [Custom Theme Builder](#custom-theme-builder)
6. [API Integration](#api-integration)
7. [Usage Guide](#usage-guide)
8. [Troubleshooting](#troubleshooting)

---

## 🌟 Overview

The TechThrive HRMS theme system provides a comprehensive theming solution with:

- **10 Pre-built Themes**: Including Light, Dark, and 8 color-based themes
- **Custom Theme Builder**: Create personalized themes with custom colors
- **Real-time Preview**: Instant theme application without page reload
- **Backend Sync**: Theme preferences saved to user profile and synced across devices
- **Global Application**: Themes apply to all components (navbar, sidebar, cards, buttons, etc.)
- **Smooth Transitions**: Elegant color transitions when switching themes
- **Responsive Design**: All themes optimized for desktop and mobile

---

## 🎨 Available Themes

### 1. **Light Theme**
- **Description**: Clean and bright
- **Use Case**: Daytime work, high-light environments
- **Colors**: 
  - Primary: `#3b82f6` (Blue)
  - Background: `#ffffff` (White)
  - Surface: `#f8fafc` (Light Gray)
  - Text: `#1e293b` (Dark Gray)

### 2. **Dark Theme** (Default)
- **Description**: Easy on the eyes
- **Use Case**: Low-light environments, reduced eye strain
- **Colors**:
  - Primary: `#3b82f6` (Blue)
  - Background: `#0f172a` (Dark Blue)
  - Surface: `#1e293b` (Slate)
  - Text: `#f8fafc` (Light)

### 3. **Ocean Blue**
- **Description**: Professional and calm
- **Use Case**: Corporate environments, professional settings
- **Colors**:
  - Primary: `#0ea5e9` (Sky Blue)
  - Background: `#051923` (Deep Blue)
  - Surface: `#0a2540` (Navy)
  - Text: `#e0f2fe` (Light Blue)

### 4. **Forest Green**
- **Description**: Natural and refreshing
- **Use Case**: Eco-friendly brands, nature-focused organizations
- **Colors**:
  - Primary: `#10b981` (Emerald)
  - Background: `#041a0f` (Dark Green)
  - Surface: `#0d2818` (Forest)
  - Text: `#d1fae5` (Mint)

### 5. **Royal Purple**
- **Description**: Creative and elegant
- **Use Case**: Creative industries, luxury brands
- **Colors**:
  - Primary: `#a855f7` (Purple)
  - Background: `#0f0520` (Deep Purple)
  - Surface: `#1e0f3d` (Violet)
  - Text: `#f3e8ff` (Lavender)

### 6. **Sunset Orange**
- **Description**: Warm and energetic
- **Use Case**: Dynamic teams, energetic environments
- **Colors**:
  - Primary: `#f97316` (Orange)
  - Background: `#1a0a03` (Dark Brown)
  - Surface: `#331508` (Brown)
  - Text: `#fed7aa` (Peach)

### 7. **Ruby Red**
- **Description**: Bold and powerful
- **Use Case**: High-energy environments, urgent operations
- **Colors**:
  - Primary: `#ef4444` (Red)
  - Background: `#1a0404` (Dark Red)
  - Surface: `#330a0a` (Maroon)
  - Text: `#fee2e2` (Light Pink)

### 8. **Teal Wave**
- **Description**: Modern and balanced
- **Use Case**: Tech companies, modern startups
- **Colors**:
  - Primary: `#14b8a6` (Teal)
  - Background: `#041614` (Dark Teal)
  - Surface: `#0a2826` (Deep Teal)
  - Text: `#ccfbf1` (Light Teal)

### 9. **Monochrome**
- **Description**: Minimalist and focused
- **Use Case**: Distraction-free work, minimalist design
- **Colors**:
  - Primary: `#6b7280` (Gray)
  - Background: `#111827` (Dark Gray)
  - Surface: `#1f2937` (Slate Gray)
  - Text: `#f9fafb` (Off White)

### 10. **Custom Theme**
- **Description**: Your personalized theme
- **Use Case**: Brand-specific colors, personal preferences
- **Colors**: User-defined via Custom Theme Builder

---

## 🏗️ Architecture

### Frontend Structure

```
hrms-frontend/src/
├── config/
│   └── themes.js              # Theme configurations and utilities
├── context/
│   └── ThemeContext.jsx       # React Context for theme state
├── pages/
│   └── Settings/
│       └── ThemeSettings.jsx  # Theme settings UI
├── api/
│   └── user.js               # API calls for theme sync
└── styles/
    └── index.css             # CSS variables and theme styles
```

### Backend Structure

```
hrms-backend/src/
├── controllers/
│   └── userController.js     # Theme preference endpoints
├── routes/
│   └── userRoutes.js         # Theme API routes
└── models/
    └── User.js               # User model with themePreference field
```

---

## 🔧 Implementation Details

### 1. Theme Configuration (`themes.js`)

The theme configuration file defines all available themes with their color palettes:

```javascript
export const themes = {
  dark: {
    name: 'Dark',
    description: 'Easy on the eyes',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      background: '#0f172a',
      surface: '#1e293b',
      surfaceHover: '#334155',
      text: '#f8fafc',
      textSecondary: '#94a3b8',
      border: '#334155',
      accent: '#3b82f6',
    },
    preview: 'bg-gradient-to-br from-slate-900 to-slate-800',
  },
  // ... other themes
};
```

**Key Functions:**

- `getTheme(themeName)`: Retrieves theme configuration, handles custom themes
- `applyTheme(themeName)`: Applies theme to DOM using CSS variables
- `getThemeList()`: Returns formatted list of themes for UI
- `getThemeNames()`: Returns array of theme IDs

### 2. Theme Context (`ThemeContext.jsx`)

React Context provides theme state management across the application:

```javascript
const ThemeContext = createContext({ 
  theme: 'dark',           // Current theme ID
  themeConfig: null,       // Current theme configuration
  setTheme: () => {},      // Function to change theme
  toggleTheme: () => {},   // Toggle between light/dark
  isChanging: false        // Loading state during theme change
});
```

**Features:**

- Persists theme to localStorage
- Syncs with backend API
- Applies theme on mount and changes
- Handles custom theme updates
- Provides loading state during transitions

### 3. CSS Variables (`index.css`)

Themes use CSS custom properties for dynamic styling:

```css
:root {
  --color-primary: #3b82f6;
  --color-primaryHover: #2563eb;
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-surfaceHover: #334155;
  --color-text: #f8fafc;
  --color-textSecondary: #94a3b8;
  --color-border: #334155;
  --color-accent: #3b82f6;
  --theme-transition: 0.3s ease-in-out;
}
```

**Component Classes:**

- `.btn-primary`: Primary action buttons
- `.btn-secondary`: Secondary buttons
- `.btn-outline`: Outlined buttons
- `.input-field`: Form inputs
- `.card`: Card containers
- `.table`: Data tables

### 4. Theme Settings UI (`ThemeSettings.jsx`)

Interactive UI for theme selection and customization:

**Features:**

- Grid layout of all available themes
- Visual preview cards with gradients
- Active theme indicator
- Custom theme builder modal
- Real-time color picker
- Live preview of custom colors
- Reset to default option

---

## 🎨 Custom Theme Builder

### How It Works

1. **Click Custom Theme**: Opens the Custom Theme Builder modal
2. **Choose Colors**: Select colors for 4 key elements:
   - **Primary Color**: Buttons, links, highlights
   - **Background Color**: Main page background (should be dark)
   - **Surface Color**: Cards, sidebar, header
   - **Text Color**: Main text (should be light for dark themes)

3. **Auto-Generation**: System automatically generates:
   - `primaryHover`: Darker shade of primary (-20% brightness)
   - `surfaceHover`: Lighter shade of surface (+10% brightness)
   - `textSecondary`: Dimmer text color (-30% brightness)
   - `border`: Lighter shade of surface (+20% brightness)
   - `accent`: Same as primary color

4. **Live Preview**: See changes in real-time preview card
5. **Apply**: Saves to localStorage and applies globally

### Color Adjustment Algorithm

```javascript
const adjustColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
};
```

### Storage

Custom theme colors are stored in localStorage:

```javascript
localStorage.setItem('customThemeColors', JSON.stringify({
  primary: '#8b5cf6',
  primaryHover: '#7c3aed',
  background: '#0f0a1f',
  surface: '#1a1333',
  surfaceHover: '#251c47',
  text: '#ede9fe',
  textSecondary: '#c4b5fd',
  border: '#2e1f5a',
  accent: '#a78bfa',
}));
```

---

## 🔌 API Integration

### Backend Endpoints

#### 1. Get Theme Preference
```
GET /api/user/theme
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "themePreference": "dark"
  }
}
```

#### 2. Update Theme Preference
```
PUT /api/user/theme
Authorization: Bearer <token>
Content-Type: application/json

{
  "themePreference": "blue"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Theme preference updated successfully",
  "data": {
    "themePreference": "blue"
  }
}
```

### Valid Theme Values

- `light`
- `dark`
- `blue`
- `green`
- `purple`
- `orange`
- `red`
- `teal`
- `grey`
- `custom`

### Database Schema

The `User` model includes a `themePreference` field:

```javascript
{
  themePreference: {
    type: String,
    enum: ['light', 'dark', 'blue', 'green', 'purple', 'orange', 'red', 'teal', 'grey', 'custom'],
    default: 'dark'
  }
}
```

### Frontend API Functions

```javascript
// Get theme preference
import { getThemePreference } from './api/user';
const { data } = await getThemePreference();

// Update theme preference
import { updateThemePreference } from './api/user';
await updateThemePreference('blue');
```

---

## 📖 Usage Guide

### For Developers

#### 1. Using Theme in Components

```javascript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, themeConfig, setTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('blue')}>
        Switch to Blue
      </button>
    </div>
  );
}
```

#### 2. Using CSS Variables

```jsx
// In JSX
<div style={{ backgroundColor: 'var(--color-surface)' }}>
  <p style={{ color: 'var(--color-text)' }}>Hello</p>
</div>

// In CSS
.my-component {
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
```

#### 3. Using Tailwind Classes

The theme system works with Tailwind's dark mode:

```jsx
<div className="bg-white dark:bg-dark-900 text-gray-900 dark:text-white">
  Content
</div>
```

#### 4. Adding a New Theme

1. Add theme to `themes.js`:
```javascript
export const themes = {
  // ... existing themes
  newTheme: {
    name: 'New Theme',
    description: 'Description here',
    colors: {
      primary: '#hexcode',
      primaryHover: '#hexcode',
      background: '#hexcode',
      surface: '#hexcode',
      surfaceHover: '#hexcode',
      text: '#hexcode',
      textSecondary: '#hexcode',
      border: '#hexcode',
      accent: '#hexcode',
    },
    preview: 'bg-gradient-to-br from-color-900 to-color-800',
  },
};
```

2. Add to backend validation in `userController.js`:
```javascript
const validThemes = ['light', 'dark', ..., 'newTheme'];
```

3. Add to User model enum in `User.js`:
```javascript
enum: ['light', 'dark', ..., 'newTheme']
```

### For End Users

#### Changing Theme

1. Navigate to **Settings** → **Theme Settings**
2. Browse available themes in the grid
3. Click on any theme card to apply it instantly
4. Theme is saved automatically and syncs across devices

#### Creating Custom Theme

1. Go to **Settings** → **Theme Settings**
2. Click on the **Custom** theme card
3. Custom Theme Builder modal opens
4. Choose colors for:
   - Primary Color (buttons, links)
   - Background Color (page background)
   - Surface Color (cards, sidebar)
   - Text Color (main text)
5. Preview your theme in real-time
6. Click **Apply Custom Theme**
7. Custom theme is saved and applied

#### Resetting Theme

Click the **Reset to Default** button in Theme Settings to revert to Dark theme.

---

## 🐛 Troubleshooting

### Theme Not Applying

**Problem**: Theme changes but colors don't update

**Solutions**:
1. Hard refresh the page (Ctrl + Shift + R)
2. Clear browser cache
3. Check browser console for errors
4. Verify localStorage has theme saved:
   ```javascript
   localStorage.getItem('theme')
   ```

### Custom Theme Not Saving

**Problem**: Custom theme resets after page reload

**Solutions**:
1. Check localStorage permissions
2. Verify customThemeColors in localStorage:
   ```javascript
   localStorage.getItem('customThemeColors')
   ```
3. Ensure you clicked "Apply Custom Theme" button
4. Check browser console for errors

### Theme Not Syncing Across Devices

**Problem**: Theme changes on one device don't reflect on another

**Solutions**:
1. Verify you're logged in with the same account
2. Check network tab for API call to `/api/user/theme`
3. Ensure backend is running and accessible
4. Check authentication token is valid
5. Manually sync by changing theme again

### Background Color Not Changing

**Problem**: Background stays the same color

**Solutions**:
1. Check if body element has inline styles overriding theme
2. Verify CSS variables are being set:
   ```javascript
   getComputedStyle(document.documentElement).getPropertyValue('--color-background')
   ```
3. Check for conflicting CSS with higher specificity
4. Ensure `applyTheme()` function is being called

### Transition Flicker

**Problem**: Colors flicker during theme change

**Solutions**:
1. This is normal during theme transition (300ms)
2. Reduce transition duration in `index.css`:
   ```css
   --theme-transition: 0.1s ease-in-out;
   ```
3. Disable transitions temporarily:
   ```css
   --theme-transition: 0s;
   ```

### Dark Mode Class Issues

**Problem**: Some components don't respond to theme

**Solutions**:
1. Ensure component uses theme CSS variables
2. Check if component has hardcoded colors
3. Verify dark mode class is on html/body:
   ```javascript
   document.documentElement.classList.contains('dark')
   ```
4. Update component to use theme-aware classes

---

## 🎯 Best Practices

### For Developers

1. **Always use CSS variables** for colors instead of hardcoded values
2. **Test all themes** when adding new components
3. **Use semantic color names** (primary, surface, text) not color names (blue, red)
4. **Provide fallbacks** for browsers that don't support CSS variables
5. **Keep transitions smooth** but not too slow (300ms recommended)
6. **Handle loading states** during theme changes
7. **Validate custom colors** to ensure readability and contrast

### For Designers

1. **Maintain contrast ratios** for accessibility (WCAG AA minimum)
2. **Test themes in different lighting** conditions
3. **Ensure text readability** on all backgrounds
4. **Keep color palettes consistent** within each theme
5. **Use gradients sparingly** for preview cards
6. **Consider colorblind users** when choosing colors
7. **Document color meanings** and usage guidelines

---

## 📊 Theme Color Reference

### Color Properties

| Property | Usage | Example |
|----------|-------|---------|
| `primary` | Main brand color, primary buttons, links | `#3b82f6` |
| `primaryHover` | Hover state for primary elements | `#2563eb` |
| `background` | Main page background | `#0f172a` |
| `surface` | Cards, modals, sidebar, header | `#1e293b` |
| `surfaceHover` | Hover state for surface elements | `#334155` |
| `text` | Primary text color | `#f8fafc` |
| `textSecondary` | Secondary text, labels, captions | `#94a3b8` |
| `border` | Borders, dividers, outlines | `#334155` |
| `accent` | Highlights, badges, notifications | `#3b82f6` |

### Accessibility Guidelines

- **Text on Background**: Minimum 7:1 contrast ratio
- **Text on Surface**: Minimum 4.5:1 contrast ratio
- **Interactive Elements**: Minimum 3:1 contrast ratio
- **Focus Indicators**: Clearly visible on all themes

---

## 🚀 Future Enhancements

### Planned Features

1. **Theme Scheduling**: Auto-switch themes based on time of day
2. **Theme Sharing**: Share custom themes with team members
3. **Theme Presets**: More pre-built themes for specific industries
4. **Advanced Customization**: Font sizes, border radius, spacing
5. **Theme Import/Export**: Save and load theme configurations
6. **Color Palette Generator**: AI-powered color suggestions
7. **Accessibility Mode**: High contrast themes for visually impaired
8. **Theme Analytics**: Track popular themes and usage patterns

---

## 📝 Version History

### v1.0.0 (Current)
- Initial theme system implementation
- 10 pre-built themes
- Custom theme builder
- Backend synchronization
- Real-time preview
- Smooth transitions

---

## 👥 Support

For issues or questions about the theme system:

1. Check this documentation first
2. Review the [Troubleshooting](#troubleshooting) section
3. Check browser console for errors
4. Contact the development team

---

## 📄 License

This theme system is part of TechThrive HRMS and follows the same license as the main application.

---

**Last Updated**: October 31, 2025  
**Maintained By**: TechThrive Development Team
