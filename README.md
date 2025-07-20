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

### Required Tables

1. **contact_submissions**
   ```sql
   CREATE TABLE contact_submissions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     subject TEXT NOT NULL,
     message TEXT NOT NULL,
     status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
   ```

2. **newsletter_subscriptions**
   ```sql
   CREATE TABLE newsletter_subscriptions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     active BOOLEAN DEFAULT true,
     subscribed_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
   ```

3. **analytics_events**
   ```sql
   CREATE TABLE analytics_events (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     event_type TEXT NOT NULL,
     event_data JSONB,
     user_agent TEXT,
     ip_address TEXT,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   
   ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
   ```

### Row Level Security Policies

```sql
-- Allow public to insert contact forms and newsletter subscriptions
CREATE POLICY "Allow public contact submissions" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public newsletter subscriptions" ON newsletter_subscriptions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public analytics events" ON analytics_events
  FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read own contact submissions" ON contact_submissions
  FOR SELECT TO authenticated USING (auth.email() = email);
```

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