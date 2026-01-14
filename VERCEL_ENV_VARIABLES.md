# Vercel Environment Variables - Ready to Copy

**IMPORTANT**: Copy these values to Vercel → Settings → Environment Variables

## Generated Secure Keys

1. **LEAD_API_KEY**: `dc68b3867bed93083a247b19ff9b85842254dd2e7735f1643032fe0fce79addb`
2. **QUOTE_APPROVAL_SECRET**: `234bd65e3c51c1ccce6b01939f7f93e4c5471db40876bb4b848d8a3ccbd89567`
3. **CRON_SECRET** (optional): `6d4a7e7bf989b43dcfea99a98066f709eccaec1b6801cb59e8a35620acba26c2`

## Required Environment Variables

Copy these to Vercel (Settings → Environment Variables):

### Database
```
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```
**Note**: This will be auto-set when you connect Vercel Postgres, or use your Neon connection string.

### API Security
```
LEAD_API_KEY=dc68b3867bed93083a247b19ff9b85842254dd2e7735f1643032fe0fce79addb
QUOTE_APPROVAL_SECRET=234bd65e3c51c1ccce6b01939f7f93e4c5471db40876bb4b848d8a3ccbd89567
```

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
**Note**: Replace `your-email@gmail.com` and `your-app-password` with your actual Gmail credentials. For Gmail, you need to create an App Password (not your regular password).

### Application URLs
```
NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://uaebusinessdesk.com
ADMIN_BASE_URL=https://uaebusinessdesk.com/admin
BRAND_NAME=UAE Business Desk
SUPPORT_EMAIL=support@uaebusinessdesk.com
```

### Optional (for automated payment reminders)
```
CRON_SECRET=6d4a7e7bf989b43dcfea99a98066f709eccaec1b6801cb59e8a35620acba26c2
```

## How to Set in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. For each variable:
   - Click **Add New**
   - **Key**: Variable name (e.g., `LEAD_API_KEY`)
   - **Value**: Variable value (copy from above)
   - **Environment**: Select `Production`, `Preview`, and `Development` as needed
   - Click **Save**
4. After adding all variables, redeploy your project

## Important Notes

- **Never commit** this file or share these keys publicly
- **DATABASE_URL** will be automatically set when you connect Vercel Postgres
- Make sure to set **SMTP credentials** with valid Gmail App Password
- All variables should be set for **Production** environment at minimum
