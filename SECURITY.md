# Security Policy

## Supported Versions

The following versions of the PinoyWest Dating Platform are currently supported with security updates:

| Version | Supported          | Status      |
| ------- | ------------------ | ----------- |
| 1.0.x   | :white_check_mark: | Current     |
| < 1.0   | :x:                | Development |

**Note:** Only the latest stable release (1.0.x) receives security updates. Please upgrade to the latest version to ensure you have all security patches.

---

## Reporting a Vulnerability

The PinoyWest team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities to:

**Email:** security@pinoywest.com  
**Subject:** [SECURITY] Brief description of the vulnerability

### What to Include

To help us understand and address the issue quickly, please include:

1. **Type of vulnerability** (e.g., XSS, SQL injection, authentication bypass)
2. **Full path of source file(s)** related to the vulnerability
3. **Location of the affected source code** (tag/branch/commit or direct URL)
4. **Step-by-step instructions** to reproduce the issue
5. **Proof-of-concept or exploit code** (if applicable)
6. **Impact assessment** - what an attacker could achieve
7. **Any special configuration** required to reproduce the issue

### Response Timeline

- **Initial Response:** Within 48 hours of report submission
- **Status Update:** Within 5 business days
- **Fix Timeline:** Depends on severity
  - **Critical:** 1-7 days
  - **High:** 7-14 days
  - **Medium:** 14-30 days
  - **Low:** 30-90 days

### What to Expect

**If the vulnerability is accepted:**
1. We will confirm receipt of your report
2. We will investigate and validate the vulnerability
3. We will work on a fix and keep you updated on progress
4. We will publicly acknowledge your responsible disclosure (unless you prefer to remain anonymous)
5. You may be eligible for recognition in our Hall of Fame

**If the vulnerability is declined:**
1. We will explain why we consider it out of scope
2. We may still appreciate the report and offer guidance

### Disclosure Policy

- Please allow us reasonable time to address the issue before any public disclosure
- We aim to release security patches as quickly as possible
- We will coordinate with you on public disclosure timing
- We prefer coordinated disclosure once a fix is available

### Scope

**In Scope:**
- Cross-Site Scripting (XSS)
- SQL Injection / NoSQL Injection
- Authentication/Authorization issues
- Server-Side Request Forgery (SSRF)
- Remote Code Execution (RCE)
- Sensitive data exposure
- Security misconfigurations
- Business logic vulnerabilities

**Out of Scope:**
- Social engineering attacks
- Physical attacks
- Denial of Service (DoS/DDoS)
- Issues in third-party services (report to the service directly)
- Issues requiring physical access to user devices
- Previously known issues already reported
- Issues in outdated/unsupported versions

### Bug Bounty

We do not currently offer a paid bug bounty program, but we greatly appreciate responsible disclosure and will:
- Publicly acknowledge your contribution (with your permission)
- Feature you in our security Hall of Fame
- Provide swag/merchandise for significant findings (when available)

### Safe Harbor

We support safe harbor for security researchers who:
- Make a good faith effort to avoid privacy violations and data destruction
- Do not exploit the vulnerability beyond what is necessary to demonstrate it
- Allow reasonable time for us to address the vulnerability
- Do not publicly disclose the vulnerability until it has been resolved

We will not pursue legal action against researchers who follow these guidelines.

---

## Security Features

For information about implemented security features and best practices, see our [Security Protection Guide](./SECURITY_PROTECTION_GUIDE.md).

### Current Security Measures

- ✅ HTTPS enforcement with HSTS
- ✅ Content Security Policy (CSP)
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ Input validation and sanitization
- ✅ Row Level Security (RLS) in database
- ✅ Rate limiting (client-side)
- ✅ Comprehensive error handling
- ✅ Security event logging

### Ongoing Improvements

- 🔄 Server-side rate limiting
- 🔄 CAPTCHA implementation
- 🔄 Enhanced CSP with nonces
- 🔄 Subresource Integrity (SRI)

---

## Security Hall of Fame

We would like to thank the following individuals for responsibly disclosing security vulnerabilities:

*No reports yet - be the first!*

---

## Additional Resources

- [Security Protection Guide](./SECURITY_PROTECTION_GUIDE.md) - Comprehensive security documentation
- [Security Analysis Report](./security-analysis-report.md) - Detailed security assessment
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Common vulnerabilities
- [Supabase Security](https://supabase.com/docs/guides/platform/going-into-prod) - Backend security

---

## Contact

For non-security related issues, please use:
- **GitHub Issues:** https://github.com/cfrazie/PinoywestDatingPlatform/issues
- **Email:** support@pinoywest.com

For security issues only:
- **Email:** security@pinoywest.com
- **PGP Key:** (Available upon request)

---

*Last updated: January 2026*
