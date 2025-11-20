# TastyCorner - Frontend Developer Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [File Organization](#file-organization)
5. [CSS Architecture](#css-architecture)
6. [JavaScript Patterns](#javascript-patterns)
7. [Component Structure](#component-structure)
8. [Styling Guidelines](#styling-guidelines)
9. [Making Changes](#making-changes)
10. [Best Practices](#best-practices)
11. [Common Tasks](#common-tasks)

---

## 🎯 Project Overview

**TastyCorner** is a modern restaurant management web application built with Flask (Python backend) and vanilla HTML/CSS/JavaScript (frontend). The frontend focuses on a clean, modern, and user-friendly interface with a vibrant color scheme matching the brand identity.

**Brand Identity:**
- **Name:** TastyCorner
- **Slogan:** "Where Every Bite Tells a Story"
- **Primary Colors:** 
  - Orange: `#FF8C00`, `#FF6B35`
  - Dark Blue: `#1e3a8a`, `#1e40af`
  - White/Light Gray backgrounds

---

## 🛠 Technology Stack

### Core Technologies
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox/Grid
- **JavaScript (ES6+)** - Vanilla JS, no frameworks
- **Jinja2** - Template engine (Flask)
- **Material Symbols** - Icon library (Google Fonts)

### Design Principles
- Mobile-first responsive design
- Glassmorphism effects
- Smooth animations and transitions
- Accessibility-focused (ARIA attributes)
- Modern gradient backgrounds

---

## 📁 Project Structure

```
res/
├── static/
│   ├── style.css          # Main stylesheet (all styles)
│   └── images/
│       ├── fav.png        # Logo file
│       └── ...
├── templates/
│   ├── base.html          # Base template (navbar, footer)
│   ├── index.html         # Homepage
│   ├── menu.html          # Menu page
│   ├── cart.html          # Shopping cart
│   ├── checkout.html      # Checkout page
│   ├── orders.html        # Order history
│   ├── wishlist.html      # Wishlist
│   ├── signin.html        # Sign in page
│   ├── signup.html        # Sign up page
│   ├── about.html         # About page
│   ├── contact.html       # Contact page
│   ├── order_confirmation.html
│   └── admin/
│       ├── base_admin.html    # Admin base template
│       ├── dashboard.html     # Admin dashboard
│       ├── login.html         # Admin login
│       └── components.html    # Admin components
└── app.py                 # Flask backend
```

---

## 📂 File Organization

### CSS Structure (`static/style.css`)

The CSS file is organized into logical sections:

1. **Reset and Base Styles** (Lines 1-37)
   - Global resets
   - Body and container styles
   - Material Symbols setup

2. **Navigation** (Lines 39-260)
   - `.navbar` - Main navigation bar
   - `.nav-brand` - Logo and brand name
   - `.nav-links` - Navigation links container
   - `.nav-link` - Individual navigation buttons
   - `.user-profile-menu` - Profile dropdown menu

3. **Buttons** (Lines 281-340)
   - `.btn` - Base button styles
   - `.btn-primary` - Primary action buttons
   - `.btn-secondary` - Secondary buttons
   - Button variants and sizes

4. **Hero Section** (Lines 339-500)
   - Homepage hero area
   - Stats and features

5. **Forms** (Lines 500-800)
   - Form inputs and labels
   - Fancy input styles (`.fancy-input`)
   - Form validation styles

6. **Cards and Containers** (Lines 800-1200)
   - `.admin-card` - Admin section cards
   - Menu item cards
   - Feature cards

7. **Admin Dashboard** (Lines 3000-5000)
   - Admin-specific styles
   - Sidebar navigation
   - Dashboard components
   - Employee management styles

8. **Responsive Design** (Lines 3000+)
   - Media queries for mobile/tablet
   - Breakpoints: 768px, 1024px

### JavaScript Patterns

JavaScript is embedded in templates using:
- **Vanilla JavaScript** (no frameworks)
- **Event delegation** for dynamic content
- **DOM manipulation** for interactive features
- **Local storage** for cart/wishlist (handled by Flask sessions)

---

## 🎨 CSS Architecture

### Naming Conventions

**BEM-inspired naming:**
- `.component-name` - Main component
- `.component-name__element` - Child element
- `.component-name--modifier` - Variant/modifier

**Examples:**
```css
.nav-link              /* Base navigation link */
.nav-link-primary      /* Primary variant */
.nav-link:hover        /* Hover state */
.user-profile-trigger  /* Profile trigger button */
.profile-avatar        /* Avatar inside profile */
```

### Color System

**Primary Colors:**
```css
--primary-orange: #FF8C00;
--primary-orange-dark: #FF6B35;
--primary-blue: #1e3a8a;
--primary-blue-light: #1e40af;
```

**Usage:**
```css
/* Orange gradient (buttons, accents) */
background: linear-gradient(135deg, #FF8C00 0%, #FF6B35 100%);

/* Dark blue (text, borders) */
color: #1e3a8a;
border-color: rgba(30, 58, 138, 0.1);
```

### Layout Patterns

**Flexbox:**
```css
.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```

**Grid:**
```css
.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}
```

**Fixed Positioning:**
```css
.user-profile-menu {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1001;
}
```

---

## 🔧 Component Structure

### Navigation Bar

**Location:** `templates/base.html`

**Structure:**
```html
<nav class="navbar">
    <div class="navbar-background"></div>
    <div class="navbar-pattern"></div>
    <div class="container">
        <div class="nav-brand">
            <!-- Logo and brand name -->
        </div>
        <div class="nav-links">
            <!-- Navigation links -->
        </div>
        <div class="user-profile-menu">
            <!-- Profile dropdown -->
        </div>
    </div>
</nav>
```

**Key Classes:**
- `.navbar` - Main container (white background, sticky)
- `.nav-brand` - Logo and brand name section
- `.nav-links` - Navigation buttons container
- `.nav-link` - Individual navigation button
- `.user-profile-menu` - Profile menu (fixed top-right)

### Profile Dropdown

**Structure:**
```html
<div class="user-profile-menu">
    <button class="user-profile-trigger">
        <div class="profile-avatar">E</div>
        <span class="profile-name">Username</span>
        <span class="profile-caret">▼</span>
    </button>
    <div class="user-profile-dropdown">
        <!-- Dropdown content -->
    </div>
</div>
```

**JavaScript:** Located in `templates/base.html` (bottom of file)
- Handles click events
- Toggles dropdown visibility
- Closes on outside click
- Keyboard support (Escape key)

---

## 🎨 Styling Guidelines

### Buttons

**Primary Button:**
```css
.btn-primary {
    background: linear-gradient(135deg, #FF8C00 0%, #FF6B35 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    transition: all 0.3s ease;
}
```

**Secondary Button:**
```css
.btn-secondary {
    background: rgba(30, 58, 138, 0.05);
    color: #1e3a8a;
    border: 1px solid rgba(30, 58, 138, 0.1);
}
```

### Cards

**Admin Card:**
```css
.admin-card {
    background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.95) 0%, 
        rgba(255, 255, 255, 0.88) 100%);
    border-radius: 24px;
    padding: 2rem;
    box-shadow: 0 20px 50px rgba(59, 130, 246, 0.12);
    backdrop-filter: blur(20px);
}
```

### Forms

**Fancy Input:**
```css
.fancy-input {
    border: 1.5px solid rgba(15, 23, 42, 0.12);
    border-radius: 16px;
    padding: 0.75rem 0.9rem 0.75rem 2.75rem;
    background: linear-gradient(120deg, 
        rgba(59, 130, 246, 0.08), 
        rgba(99, 102, 241, 0.05));
}
```

### Animations

**Floating Logo:**
```css
@keyframes logoFloat {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-5px) scale(1.05); }
}
```

**Gradient Shift:**
```css
@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
```

---

## ✏️ Making Changes

### Adding a New Page

1. **Create template** in `templates/`:
```html
{% extends "base.html" %}
{% block title %}Page Title - TastyCorner{% endblock %}
{% block content %}
<!-- Your content here -->
{% endblock %}
```

2. **Add route** in `app.py`:
```python
@app.route('/your-page')
def your_page():
    return render_template('your_page.html')
```

3. **Add navigation link** in `templates/base.html`:
```html
<a href="{{ url_for('your_page') }}" class="nav-link">
    <span class="nav-icon">📋</span>
    <span>Your Page</span>
</a>
```

### Modifying Styles

1. **Find the component** in `static/style.css`
2. **Locate the class** (use search/find)
3. **Modify properties** while maintaining consistency
4. **Test responsiveness** at different screen sizes

### Adding New Components

1. **Create HTML structure** in template
2. **Add CSS classes** following naming conventions
3. **Add styles** in appropriate section of `style.css`
4. **Add JavaScript** if needed (in template or separate file)

---

## ✅ Best Practices

### CSS

1. **Use consistent spacing:**
   - Small: `0.5rem`
   - Medium: `1rem`
   - Large: `2rem`

2. **Maintain color consistency:**
   - Always use brand colors
   - Use rgba() for transparency
   - Keep gradients consistent

3. **Responsive design:**
   - Mobile-first approach
   - Test at 320px, 768px, 1024px, 1920px
   - Use relative units (rem, %, vw/vh)

4. **Performance:**
   - Minimize use of `!important`
   - Use CSS transforms for animations
   - Avoid deep nesting (max 3-4 levels)

### JavaScript

1. **Event handling:**
   - Use event delegation for dynamic content
   - Remove event listeners when needed
   - Handle errors gracefully

2. **DOM manipulation:**
   - Cache DOM queries
   - Batch DOM updates
   - Use `requestAnimationFrame` for animations

3. **Code organization:**
   - Keep functions small and focused
   - Use descriptive variable names
   - Comment complex logic

### HTML

1. **Semantic markup:**
   - Use proper HTML5 elements
   - Include ARIA attributes for accessibility
   - Maintain proper heading hierarchy

2. **Template structure:**
   - Extend `base.html` for consistency
   - Use Jinja2 blocks effectively
   - Keep templates DRY (Don't Repeat Yourself)

---

## 🔨 Common Tasks

### Changing Brand Colors

1. **Find color definitions** in `static/style.css`
2. **Search for:** `#FF8C00`, `#FF6B35`, `#1e3a8a`
3. **Replace with new colors** throughout the file
4. **Update gradients** to match new palette

### Modifying Navigation

**Add new link:**
```html
<a href="{{ url_for('route_name') }}" class="nav-link">
    <span class="nav-icon">📋</span>
    <span>Link Text</span>
</a>
```

**Change link style:**
- Modify `.nav-link` in CSS
- Or use `.nav-link-primary` for highlighted links

### Updating Logo

1. **Replace** `static/images/fav.png`
2. **Update size** in `.brand-icon` if needed:
```css
.brand-icon {
    width: 70px;
    height: 70px;
}
```

### Adjusting Profile Menu

**Change position:**
```css
.user-profile-menu {
    position: fixed;
    top: 1rem;      /* Distance from top */
    right: 1rem;    /* Distance from right */
}
```

**Change size:**
```css
.user-profile-trigger .profile-avatar {
    width: 40px;
    height: 40px;
}
```

### Making Components Responsive

**Add media query:**
```css
@media (max-width: 768px) {
    .your-component {
        /* Mobile styles */
    }
}
```

---

## 🐛 Debugging Tips

### CSS Not Applying?

1. **Check browser cache:** Hard refresh (Ctrl+F5)
2. **Verify class names:** Use browser DevTools
3. **Check specificity:** More specific selectors win
4. **Look for conflicts:** Search for duplicate class names

### JavaScript Not Working?

1. **Open browser console:** F12 → Console tab
2. **Check for errors:** Red error messages
3. **Verify selectors:** Use `document.querySelector()` in console
4. **Check event listeners:** Use DevTools Event Listeners panel

### Layout Issues?

1. **Use DevTools:** Inspect element (F12)
2. **Check flexbox/grid:** Verify display properties
3. **View computed styles:** See final calculated values
4. **Test responsive:** Use device toolbar (Ctrl+Shift+M)

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 768px) { }

/* Tablet */
@media (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }
```

---

## 🎯 Key Components Reference

### Navigation
- **File:** `templates/base.html`
- **Styles:** Lines 39-260 in `style.css`
- **JavaScript:** Bottom of `base.html`

### Admin Dashboard
- **File:** `templates/admin/dashboard.html`
- **Styles:** Lines 3000-5000 in `style.css`
- **JavaScript:** Embedded in dashboard template

### Forms
- **Styles:** Lines 500-800 in `style.css`
- **Classes:** `.fancy-input`, `.form-group`, `.form-row`

### Cards
- **Styles:** Lines 800-1200 in `style.css`
- **Classes:** `.admin-card`, `.feature-card`, `.menu-item-card`

---

## 📚 Resources

### Icons
- **Material Symbols:** https://fonts.google.com/icons
- **Usage:** `<span class="material-symbols-outlined">icon_name</span>`

### Colors
- **Brand Orange:** #FF8C00, #FF6B35
- **Brand Blue:** #1e3a8a, #1e40af
- **Neutrals:** #64748b, #f8fafc, #ffffff

### Typography
- **Font Family:** Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **Weights:** 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

---

## 🚀 Quick Start

1. **Start Flask server:**
   ```bash
   python app.py
   ```

2. **Open browser:**
   ```
   http://localhost:5000
   ```

3. **Make changes:**
   - Edit `static/style.css` for styles
   - Edit `templates/*.html` for structure
   - Hard refresh (Ctrl+F5) to see changes

---

## 📝 Notes

- **No build process:** Direct HTML/CSS/JS editing
- **Jinja2 templates:** Use `{% %}` for logic, `{{ }}` for variables
- **Session-based:** Cart/wishlist stored in Flask sessions
- **Admin access:** Requires admin login (`/admin/login`)

---

## 🤝 Contributing

When making changes:
1. Follow existing code style
2. Test on multiple browsers
3. Ensure mobile responsiveness
4. Maintain brand consistency
5. Update this guide if adding new patterns

---

**Last Updated:** 2024
**Version:** 1.0

