# PinoyWest Landing Page

A comprehensive full-stack landing page for a Filipino-Western dating platform built with React, TypeScript, and Supabase.

## 🚀 Features

### Frontend
- **Modern React Architecture**: Built with React 18, TypeScript, and Vite
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion for engaging user interactions
- **Optimized Images**: Advanced image optimization with lazy loading and responsive images
- **SEO Optimized**: Meta tags, semantic HTML, and performance optimizations
- **Accessibility**: WCAG 2.1 compliant with proper ARIA labels
- **Form Validation**: Zod schema validation with custom hooks
- **Error Handling**: Comprehensive error boundaries and loading states

### Backend (Supabase)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Built-in user management
- **Real-time**: Live updates and notifications
- **API**: Auto-generated REST and GraphQL APIs
- **Storage**: File uploads and management
- **Edge Functions**: Serverless functions for custom logic

### Key Sections
1. **Hero Section**: Compelling value proposition with animated elements
2. **Features**: Comprehensive platform capabilities showcase
3. **Testimonials**: Social proof with verified user stories
4. **Pricing**: Flexible plans with billing toggle
5. **Newsletter**: Email subscription with benefits
6. **Contact**: Multi-channel contact form and information

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Forms**: React Hook Form, Zod validation
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Testing**: Vitest, Testing Library
- **Deployment**: Netlify (Frontend), Supabase (Backend)
- **Error Handling**: Comprehensive error boundary system with offline support
- **Monitoring**: Real-time error logging and analytics

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pinoywest-landing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials and other configuration values.

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations (see Database Setup section)
   - Update your `.env` file with the project URL and anon key

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

### Automated Migration Setup (Recommended)

The project uses Supabase migrations for database schema management. All migrations are located in `supabase/migrations/`.

**Quick Start:**

1. Install Supabase CLI:
   ```bash
   # macOS
   brew install supabase/tap/supabase
   
   # Linux
   curl -fsSL https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz | tar -xz
   sudo mv supabase /usr/local/bin/
   ```

2. Start local Supabase instance (requires Docker):
   ```bash
   supabase start
   ```

3. Migrations will be applied automatically!

**Access your local database:**
- Studio UI: `http://localhost:54323`
- Database URL: `postgresql://postgres:postgres@localhost:54322/postgres`

**For detailed migration instructions, see:** [`docs/DATABASE_MIGRATIONS.md`](docs/DATABASE_MIGRATIONS.md)

### Schema Overview

The database includes tables for:
- **User Profiles & Authentication** - UUID-based user management
- **Analytics Events** - User behavior tracking with `user_id` (UUID) references
- **Contact Submissions** - Customer inquiries
- **Newsletter Subscriptions** - Email marketing
- **Messaging & Chat** - Real-time communication
- **Video Calls** - Call records and scheduling
- **Payments & Subscriptions** - Stripe integration
- **Cultural Features** - Cultural learning and compatibility

All migrations are:
- ✅ Idempotent (safe to run multiple times)
- ✅ Type-verified (analytics_events.user_id matches auth.users.id as UUID)
- ✅ Tested in CI/CD pipeline
- ✅ Include proper indexes and RLS policies

### Manual Schema Setup (Not Recommended)

If you prefer to set up the schema manually, refer to the migration files in `supabase/migrations/`. However, using the Supabase CLI is strongly recommended for consistency.

## 🧪 Testing

Run the test suite:
```bash
npm run test
```

Run tests with UI:
```bash
npm run test:ui
```

## 🚀 Deployment

### Frontend (Netlify)
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Backend (Supabase)
1. Database and APIs are automatically deployed
2. Set up custom domain if needed
3. Configure email templates
4. Set up webhooks for integrations

## 📊 Analytics & Monitoring

### Built-in Analytics
- Page views and user interactions
- Google Tag Manager integration with comprehensive event tracking
- Form submissions and conversions
- Newsletter subscriptions
- Error tracking and performance metrics
- Image loading performance monitoring (development mode)

### External Integrations
- Google Analytics (optional)
- Google Tag Manager (GTM-TNRNVD42)
- Google Tag Manager for advanced tracking
- Hotjar for user behavior (optional)
- Sentry for error monitoring (optional)

## 🔒 Security Features

- **Input Sanitization**: All user inputs are validated and sanitized
- **HTTPS Enforcement**: SSL certificates and secure headers
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Sensitive data stored securely
- **Row Level Security**: Database-level access control
- **Error Handling**: Secure error logging without exposing sensitive data
- **Offline Support**: Graceful degradation when offline

## 🎨 Customization

### Colors and Branding
Update the color palette in `tailwind.config.js`:
```javascript
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
```

### Content Management
- Update text content in component files
- Replace images with your own assets
- Modify testimonials and pricing plans
- Customize contact information

## 📈 Performance Optimization

- **Code Splitting**: Automatic route-based code splitting
- **Advanced Image Optimization**: 
  - Responsive images with srcSet and sizes
  - Lazy loading with intersection observer
  - WebP format detection and optimization
  - Critical image preloading
  - Performance monitoring in development
- **Lazy Loading**: Components and images loaded on demand
- **Bundle Analysis**: Use `npm run build` to analyze bundle size
- **Caching**: Proper HTTP caching headers
- **CDN**: Static assets served via CDN
- **Error Recovery**: Automatic retry mechanisms with exponential backoff
- **Circuit Breakers**: Prevent cascading failures in API calls
- **Offline Caching**: Smart caching for offline functionality

### Image Optimization Features
- **Automatic Format Detection**: WebP support with JPEG fallback
- **Responsive Images**: Multiple sizes generated automatically
- **Lazy Loading**: Images load only when entering viewport
- **Critical Image Preloading**: Hero and above-the-fold images load immediately
- **Performance Monitoring**: Real-time metrics in development (Ctrl+Shift+I)
- **Error Handling**: Graceful fallbacks for failed image loads
- **Progressive Enhancement**: Blur placeholders while loading
- **Global Error Boundary**: Catches and handles React component errors
- **Network Error Recovery**: Automatic retry with exponential backoff
- **Offline Queue**: Actions are queued when offline and executed when back online
- **User-Friendly Messages**: Technical errors converted to user-friendly language
- **Error Analytics**: Comprehensive error logging and monitoring dashboard
- **Validation Errors**: Real-time form validation with helpful error messages
- **Circuit Breakers**: Prevent system overload during high error rates
- **Graceful Degradation**: App continues to function even when some services fail

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@pinoywest.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

## 🔄 Maintenance Guidelines

### Regular Updates
- Update dependencies monthly
- Monitor security vulnerabilities
- Review and update content quarterly
- Backup database regularly

### Performance Monitoring
- Monitor Core Web Vitals
- Track conversion rates
- Analyze user feedback
- Review error logs weekly

### SEO Maintenance
- Update meta descriptions
- Monitor search rankings
- Add new content regularly
- Optimize for new keywords