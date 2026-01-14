# Vercel Deployment Guide

This guide walks you through deploying the UAE Business Desk application to Vercel.

## Prerequisites

- ✅ Code pushed to GitHub repository
- ✅ Vercel account connected to GitHub
- ✅ Environment variables ready (see `VERCEL_ENV_VARIABLES.md`)

## Step 1: Connect Database

### Option A: Use Vercel Postgres

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Postgres**
4. Choose a name and region
5. Once created, the `DATABASE_URL` will be automatically set as an environment variable

### Option B: Use Neon (Recommended for Serverless)

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy the connection string (it will look like: `postgresql://user:password@host/database?sslmode=require`)
4. In Vercel → Settings → Environment Variables, add:
   - Key: `DATABASE_URL`
   - Value: Your Neon connection string
   - Environment: Production, Preview, Development

## Step 2: Set Environment Variables

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Add all variables from `VERCEL_ENV_VARIABLES.md`
3. Make sure to:
   - Replace `your-email@gmail.com` with your actual email
   - Replace `your-app-password` with your Gmail App Password
   - Set all variables for **Production** environment (and Preview/Development if needed)

### Required Variables Checklist

- [ ] `DATABASE_URL` (auto-set if using Vercel Postgres, or manually set for Neon)
- [ ] `LEAD_API_KEY`
- [ ] `QUOTE_APPROVAL_SECRET`
- [ ] `SMTP_HOST`
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`
- [ ] `SMTP_FROM`
- [ ] `ADMIN_NOTIFY_EMAIL`
- [ ] `EMAIL_LOGO_URL`
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_BASE_URL`
- [ ] `ADMIN_BASE_URL`
- [ ] `BRAND_NAME`
- [ ] `SUPPORT_EMAIL`
- [ ] `CRON_SECRET` (optional)

## Step 3: Configure Vercel Project Settings

1. Go to **Settings** → **General**
2. Verify:
   - **Root Directory**: `ubd-admin` (if not set automatically)
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `.next` (should be auto-detected)
   - **Install Command**: `npm install` (should be auto-detected)

## Step 4: Deploy

1. Go to **Deployments** tab
2. If you just pushed to GitHub, a new deployment should start automatically
3. If not, click **Redeploy** on the latest deployment
4. Wait for the build to complete
5. Check build logs for any errors

## Step 5: Run Database Migrations

After successful deployment, you need to run Prisma migrations to create the database tables.

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Link project: `vercel link` (select your project)
4. Run migrations:
   ```bash
   cd ubd-admin
   npx prisma migrate deploy
   ```
   This will use the `DATABASE_URL` from your Vercel environment variables.

### Option B: Using Vercel's Database Console

1. Go to your database in Vercel (Storage tab)
2. Click **Connect** or **Query**
3. Copy and run each migration SQL file from `ubd-admin/prisma/migrations/` in order:
   - `20251226124858_init/migration.sql`
   - `20251230180031_add_whatsapp_session/migration.sql`
   - `20260101151402_add_whatsapp_lead/migration.sql`
   - `20260103123028_add_quote_declined_at/migration.sql`
   - `20260103123827_add_quote_decision_tracking_fields/migration.sql`
   - `20260103125157_add_quote_whatsapp_tracking/migration.sql`
   - `20260103211710_add_invoice_html_and_payment_link/migration.sql`
   - `20260104022002_add_payment_reminder_and_decline_tracking/migration.sql`
   - `20260104023105_add_cron_run_log/migration.sql`

### Option C: Using Neon Console

1. Go to Neon Console → Your Project → SQL Editor
2. Run migrations in the same order as Option B

## Step 6: Verify Database Tables

After running migrations, verify that tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see tables like:
- `Lead`
- `Activity`
- `Agent`
- `LeadAgent`
- `Callback`
- `CronRunLog`
- etc.

## Step 7: Configure Domain

1. Go to **Settings** → **Domains**
2. Add your domain: `uaebusinessdesk.com`
3. Add www subdomain: `www.uaebusinessdesk.com`
4. Vercel will provide DNS records (usually A or CNAME records)
5. Copy the DNS records

## Step 8: Update Namecheap DNS

1. Log in to Namecheap
2. Go to **Domain List** → Select `uaebusinessdesk.com`
3. Go to **Advanced DNS**
4. Update DNS records with Vercel's provided records:
   - Usually an A record pointing to Vercel's IP
   - Or CNAME records pointing to Vercel's hostname
5. Save changes
6. Wait for DNS propagation (can take up to 48 hours, usually 1-2 hours)

## Step 9: Test Deployment

### Test Static Site
1. Visit `https://uaebusinessdesk.com` (or Vercel preview URL)
2. Verify homepage loads correctly
3. Check that CSS and images load
4. Test navigation links

### Test Admin Dashboard
1. Visit `https://uaebusinessdesk.com/admin`
2. Should see login page
3. Login with password: `9211`
4. Verify dashboard loads

### Test Lead Capture
1. Go to contact page on main site
2. Fill out and submit the lead form
3. Check admin dashboard for new lead
4. Verify email notification was sent

### Test Email Functionality
1. In admin dashboard, open a lead
2. Send a quote email
3. Verify email is received
4. Check email formatting and links

### Test Database
1. Create a test lead
2. Verify it appears in admin dashboard
3. Check that data persists after page refresh

## Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Solution: Verify all required environment variables are set in Vercel

**Error: Database connection failed**
- Solution: Check `DATABASE_URL` is correct and database is accessible
- Verify database is running and accessible from Vercel's IPs

**Error: TypeScript errors**
- Solution: Run `npm run build` locally to identify errors
- Fix errors and push to GitHub

### Deployment Succeeds but Site Doesn't Work

**404 errors on static pages**
- Solution: Verify static files are in `public/` directory
- Check Next.js routing configuration

**Database errors**
- Solution: Verify migrations were run successfully
- Check `DATABASE_URL` is correct
- Verify database tables exist

**Email not sending**
- Solution: Verify SMTP credentials are correct
- For Gmail, ensure you're using an App Password (not regular password)
- Check SMTP settings match your email provider

### Domain Not Working

**DNS propagation delay**
- Solution: Wait up to 48 hours for DNS to propagate
- Use `dig` or `nslookup` to check DNS records
- Verify DNS records match Vercel's requirements

**SSL certificate issues**
- Solution: Vercel automatically provisions SSL certificates
- Wait a few minutes after adding domain
- Check Vercel dashboard for SSL status

## Next Steps

After successful deployment:

1. ✅ Monitor error logs in Vercel dashboard
2. ✅ Set up monitoring/analytics (optional)
3. ✅ Configure backup strategy for database
4. ✅ Set up automated backups (if using Neon, backups are automatic)
5. ✅ Test all critical workflows end-to-end

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Vercel function logs
3. Review database connection logs
4. Verify all environment variables are set correctly
