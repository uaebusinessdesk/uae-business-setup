# Vercel Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment ✅

- [x] Code pushed to GitHub
- [x] Build passes locally (`npm run build`)
- [x] TypeScript errors resolved
- [x] All SEO features removed
- [x] Secure keys generated
- [x] Environment variables documented

## Step 1: Database Setup

- [ ] Create Postgres database (Vercel Postgres or Neon)
- [ ] Copy connection string
- [ ] Set `DATABASE_URL` in Vercel environment variables

## Step 2: Environment Variables

Set all variables in Vercel → Settings → Environment Variables:

### Database
- [ ] `DATABASE_URL`

### API Security
- [ ] `LEAD_API_KEY` = `dc68b3867bed93083a247b19ff9b85842254dd2e7735f1643032fe0fce79addb`
- [ ] `QUOTE_APPROVAL_SECRET` = `234bd65e3c51c1ccce6b01939f7f93e4c5471db40876bb4b848d8a3ccbd89567`

### Email (SMTP)
- [ ] `SMTP_HOST` = `smtp.gmail.com`
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_USER` = `[your-email@gmail.com]`
- [ ] `SMTP_PASS` = `[your-gmail-app-password]`
- [ ] `SMTP_FROM` = `[your-email@gmail.com]`
- [ ] `ADMIN_NOTIFY_EMAIL` = `support@uaebusinessdesk.com`
- [ ] `EMAIL_LOGO_URL` = `https://uaebusinessdesk.com/assets/footer-logo.png`

### Application URLs
- [ ] `NODE_ENV` = `production`
- [ ] `NEXT_PUBLIC_BASE_URL` = `https://uaebusinessdesk.com`
- [ ] `ADMIN_BASE_URL` = `https://uaebusinessdesk.com/admin`
- [ ] `BRAND_NAME` = `UAE Business Desk`
- [ ] `SUPPORT_EMAIL` = `support@uaebusinessdesk.com`

### Optional
- [ ] `CRON_SECRET` = `6d4a7e7bf989b43dcfea99a98066f709eccaec1b6801cb59e8a35620acba26c2`

## Step 3: Vercel Project Configuration

- [ ] Verify Root Directory is set to `ubd-admin` (in Settings → General)
- [ ] Verify Framework Preset is `Next.js`
- [ ] Verify Build Command is `npm run build`
- [ ] Verify Output Directory is `.next`

## Step 4: Deploy

- [ ] Push latest code to GitHub (if not already done)
- [ ] Go to Vercel → Deployments
- [ ] Wait for automatic deployment or click "Redeploy"
- [ ] Verify build completes successfully
- [ ] Check build logs for any errors

## Step 5: Run Database Migrations

Choose one method:

### Option A: Vercel CLI
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`
- [ ] Link project: `vercel link`
- [ ] Run: `cd ubd-admin && npm run db:migrate:deploy`

### Option B: Database Console
- [ ] Connect to database via Vercel/Neon console
- [ ] Run migrations in order (see DEPLOYMENT_GUIDE.md)

### Option C: Local with DATABASE_URL
- [ ] Set `DATABASE_URL` locally (temporarily)
- [ ] Run: `cd ubd-admin && npm run db:migrate:deploy`

- [ ] Verify tables were created

## Step 6: Domain Configuration

- [ ] Go to Vercel → Settings → Domains
- [ ] Add `uaebusinessdesk.com`
- [ ] Add `www.uaebusinessdesk.com`
- [ ] Copy DNS records from Vercel
- [ ] Log in to Namecheap
- [ ] Go to Domain List → Advanced DNS
- [ ] Update DNS records with Vercel's records
- [ ] Save changes
- [ ] Wait for DNS propagation (1-48 hours)

## Step 7: Testing

### Static Site
- [ ] Visit `https://uaebusinessdesk.com` (or preview URL)
- [ ] Verify homepage loads
- [ ] Check CSS and images load correctly
- [ ] Test navigation links
- [ ] Test `/mainland` page
- [ ] Test `/freezone` page
- [ ] Test `/offshore` page
- [ ] Test `/contact` page

### Admin Dashboard
- [ ] Visit `https://uaebusinessdesk.com/admin`
- [ ] Verify login page appears
- [ ] Login with password: `9211`
- [ ] Verify dashboard loads
- [ ] Check leads list
- [ ] Verify navigation works

### Lead Capture
- [ ] Fill out contact form on main site
- [ ] Submit form
- [ ] Verify lead appears in admin dashboard
- [ ] Check email notification was sent

### Email Functionality
- [ ] Open a lead in admin dashboard
- [ ] Send a quote email
- [ ] Verify email is received
- [ ] Check email formatting
- [ ] Test quote approval link

### Database
- [ ] Create a test lead
- [ ] Verify it appears in admin
- [ ] Check data persists after refresh
- [ ] Test updating lead information

## Post-Deployment

- [ ] Monitor error logs in Vercel
- [ ] Set up database backups (if not automatic)
- [ ] Document any issues encountered
- [ ] Update team on deployment status

## Troubleshooting

If something doesn't work:

1. **Check Vercel deployment logs** for errors
2. **Verify all environment variables** are set correctly
3. **Check database connection** - verify DATABASE_URL is correct
4. **Verify migrations ran** - check that tables exist
5. **Check email settings** - verify SMTP credentials
6. **Review DNS settings** - ensure records are correct

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`
- **Environment Variables**: See `VERCEL_ENV_VARIABLES.md`
