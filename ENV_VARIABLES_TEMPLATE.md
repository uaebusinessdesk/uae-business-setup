# Environment Variables Template for Vercel Deployment

Copy these variables to your Vercel project settings. Mark sensitive variables appropriately.

## Required Variables

### Database
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```
- **Source**: Vercel Postgres database connection string
- **How to get**: Create Postgres database in Vercel → Storage → Copy connection string

### API Security
```
LEAD_API_KEY=your-secure-random-key-here
```
- **Purpose**: API key for lead capture endpoint
- **Generate**: Use a secure random string (e.g., `openssl rand -hex 32`)

```
QUOTE_APPROVAL_SECRET=your-secure-random-secret-here
```
- **Purpose**: JWT secret for quote approval tokens
- **Generate**: Use a secure random string (e.g., `openssl rand -hex 32`)
- **Alternative**: Can use `JWT_SECRET` instead

### Email (SMTP)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
ADMIN_NOTIFY_EMAIL=support@uaebusinessdesk.com
EMAIL_LOGO_URL=https://uaebusinessdesk.com/assets/footer-logo.png
```
- **SMTP_PASS**: For Gmail, use an App Password (not your regular password)
- **SMTP_FROM**: Should match SMTP_USER domain for deliverability

### Application URLs
```
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://uaebusinessdesk.com
ADMIN_BASE_URL=https://uaebusinessdesk.com/admin
BRAND_NAME=UAE Business Desk
```

## Optional Variables

### WhatsApp (Only if using API endpoint `/api/leads/[id]/whatsapp/quote-notification`)
```
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_TOKEN=your-access-token
WHATSAPP_GRAPH_VERSION=v22.0
WHATSAPP_FLOW_ID=your-flow-id
```
**Note**: Manual WhatsApp sending from admin dashboard does NOT require these credentials (uses WhatsApp web links).

### Google APIs (Only if using SEO features)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://uaebusinessdesk.com/admin/api/admin/seo/auth/callback
PAGESPEED_API_KEY=your-pagespeed-api-key
```

### Cron Jobs (Only if using automated payment reminders)
```
CRON_SECRET=your-secure-cron-secret
```
- **Purpose**: Secret token for authenticating cron job requests
- **Generate**: Use a secure random string

## How to Set in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: Variable name (e.g., `DATABASE_URL`)
   - **Value**: Variable value
   - **Environment**: Select `Production`, `Preview`, and/or `Development` as needed
4. Click **Save**

## Important Notes

- **Never commit** `.env` files to Git
- **DATABASE_URL** will be automatically set when you connect Vercel Postgres
- **LEAD_API_KEY** and **QUOTE_APPROVAL_SECRET** must be strong, random strings
- **SMTP credentials** must be valid and tested before deployment
- **WhatsApp credentials** are optional - only needed for API-based automatic sending
