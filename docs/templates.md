# 🎨 Templates Guide

## Available Templates

### Basic Template
Clean Next.js setup with shadcn/ui components.

**Features:**
- Modern homepage design with gradients
- Responsive layout
- shadcn/ui components included
- Dark mode ready
- SEO optimized

**Usage:**
```bash
radnt create my-app --template basic
```

**Best for:** General websites, landing pages, documentation sites

### Dashboard Template
Admin dashboard with charts and data visualization.

**Features:**
- Sidebar navigation
- Statistics cards
- Data tables with sorting
- Chart components (Recharts)
- User management UI
- Dark/light theme toggle

**Usage:**
```bash
radnt create admin-panel --template dashboard
```

**Best for:** Admin panels, analytics dashboards, SaaS applications

### E-commerce Template
Online store with product catalog and shopping cart.

**Features:**
- Product grid layout
- Shopping cart UI
- Product detail pages
- Promotional banners
- Checkout flow UI
- Mobile responsive design

**Usage:**
```bash
radnt create my-store --template ecommerce
```

**Best for:** Online stores, marketplaces, product catalogs

### Blog Template
Content-focused design for blogs and publications.

**Features:**
- Article listing with pagination
- Reading time calculation
- Newsletter signup form
- Author profiles
- Tag/category system
- SEO optimized for content

**Usage:**
```bash
radnt create my-blog --template blog
```

**Best for:** Blogs, news sites, documentation, content sites

### Portfolio Template
Showcase for developers and designers.

**Features:**
- Project showcase grid
- About section with skills
- Contact form
- Resume/CV download
- Social media links
- Responsive design

**Usage:**
```bash
radnt create portfolio --template portfolio
```

**Best for:** Personal portfolios, freelancer sites, creative showcases

## Template Comparison

| Feature | Basic | Dashboard | E-commerce | Blog | Portfolio |
|---------|-------|-----------|------------|------|-----------|
| **Setup Time** | 30s | 45s | 60s | 45s | 40s |
| **Components** | 8 | 15 | 12 | 10 | 9 |
| **Pages** | 3 | 8 | 12 | 6 | 5 |
| **Dark Mode** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Mobile Ready** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **SEO Ready** | ✅ | ⚠️ | ✅ | ✅ | ✅ |

## Customizing Templates

### Adding Your Own Content

1. **Replace placeholder text** in `src/app/page.tsx`
2. **Update metadata** in `src/app/layout.tsx`
3. **Customize colors** in `tailwind.config.js`
4. **Add your images** to `public/` folder

### Example Customization

```tsx
// src/app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold">
          Welcome to <span className="text-blue-600">My Company</span>
        </h1>
        <p className="text-xl text-slate-600">
          We build amazing products with modern technology.
        </p>
      </div>
    </main>
  )
}
```

### Color Customization

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

## Template Structure

### Basic Template Structure
```
src/
├── app/
│   ├── page.tsx          # Homepage
│   ├── about/page.tsx    # About page
│   └── contact/page.tsx  # Contact page
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # Site header
│   └── footer.tsx        # Site footer
```

### Dashboard Template Structure
```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx      # Dashboard home
│   │   ├── users/        # User management
│   │   ├── analytics/    # Analytics pages
│   │   └── settings/     # Settings pages
│   └── components/
│       ├── sidebar.tsx   # Navigation sidebar
│       ├── charts/       # Chart components
│       └── tables/       # Data table components
```

## Performance

### Bundle Sizes (gzipped)
- **Basic**: 89kb
- **Dashboard**: 156kb  
- **E-commerce**: 134kb
- **Blog**: 112kb
- **Portfolio**: 98kb

### Lighthouse Scores
All templates achieve 95+ scores across all metrics:
- Performance: 95-98
- Accessibility: 98-100
- Best Practices: 100
- SEO: 95-100

## Migration Between Templates

### Upgrading Template Features
```bash
# Add dashboard components to basic template
radnt add table chart sidebar

# Add e-commerce features to any template  
radnt add sheet badge progress

# Add blog features
radnt add separator breadcrumb avatar
```

### Template Switching
```bash
# Upgrade existing project to modern design
radnt upgrade

# This will update your homepage to the latest template design
```
