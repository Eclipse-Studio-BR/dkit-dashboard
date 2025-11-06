# Deployment Guide: Neon Database + Vercel

This guide will walk you through setting up your dKit Partners Dashboard with Neon PostgreSQL database and deploying to Vercel.

## Prerequisites

- A GitHub account (for Vercel deployment)
- Node.js 20+ installed locally
- Git installed

---

## Part 1: Setting Up Neon Database

### Step 1: Create a Neon Account

1. Go to [https://neon.tech](https://neon.tech)
2. Click "Sign Up" and create an account (you can use GitHub to sign in)
3. Verify your email if required

### Step 2: Create a New Project

1. Once logged in, click **"New Project"**
2. Choose a project name (e.g., "dkit-dashboard")
3. Select your preferred region (choose one close to your users)
4. Click **"Create Project"**

### Step 3: Get Your Database Connection String

1. After project creation, you'll see your connection details
2. Copy the **Connection String** - it will look like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. **IMPORTANT**: Save this connection string securely - you'll need it for both local development and Vercel deployment

### Step 4: Run Database Migrations

1. Create a `.env` file in your project root (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Neon connection string:
   ```env
   DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   SESSION_SECRET=your-random-secret-here-change-this
   NODE_ENV=development
   PORT=5000
   ```

3. Generate a secure session secret:
   ```bash
   # On macOS/Linux
   openssl rand -base64 32
   
   # Or use Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   Copy the output and replace `your-random-secret-here-change-this` in your `.env` file

4. Install dependencies:
   ```bash
   npm install
   ```

5. Run the database migration using the Neon SQL Editor:
   - Go to your Neon project dashboard
   - Click on **"SQL Editor"** in the left sidebar
   - Copy the contents of `migrations/0000_initial.sql`
   - Paste it into the SQL Editor
   - Click **"Run"** to execute the migration
   
   **OR** use Drizzle Kit to push the schema:
   ```bash
   npm run db:push
   ```

### Step 5: Test Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:5000`
3. Try registering a new account to verify database connectivity

---

## Part 2: Deploying to Vercel

### Step 1: Prepare Your Repository

1. Initialize a git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Ready for Vercel deployment"
   ```

2. Push to GitHub:
   ```bash
   # Create a new repository on GitHub first, then:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Create a Vercel Account

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"** and use your GitHub account
3. Authorize Vercel to access your GitHub repositories

### Step 3: Import Your Project

1. From your Vercel dashboard, click **"Add New..."** → **"Project"**
2. Select your GitHub repository from the list
3. Vercel will auto-detect the framework settings

### Step 4: Configure Environment Variables

Before deploying, you need to add environment variables:

1. In the project configuration screen, scroll to **"Environment Variables"**
2. Add the following variables:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `SESSION_SECRET` | Your generated session secret (same as local) |
   | `NODE_ENV` | `production` |

3. Make sure all variables are set for **Production**, **Preview**, and **Development** environments

### Step 5: Configure Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset**: None (or Vite)
- **Build Command**: `npm run build`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

### Step 6: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-3 minutes)
3. Once complete, Vercel will provide you with a URL (e.g., `https://your-project.vercel.app`)

### Step 7: Verify Deployment

1. Visit your Vercel URL
2. Register a new account
3. Test the dashboard functionality
4. Check that data persists across sessions

---

## Part 3: Post-Deployment Configuration

### Custom Domain (Optional)

1. In your Vercel project settings, go to **"Domains"**
2. Click **"Add Domain"**
3. Enter your custom domain
4. Follow Vercel's instructions to configure DNS

### Enable Vercel Analytics (Optional)

1. In your Vercel project, go to **"Analytics"**
2. Click **"Enable Web Analytics"**
3. Follow the setup instructions

### Session Store Configuration (Important for Production)

The current implementation uses `MemoryStore` for sessions, which doesn't work well in serverless environments. Consider upgrading to a persistent session store:

1. **Option A: PostgreSQL Session Store** (Recommended)
   - Already included: `connect-pg-simple`
   - Update `server/routes.ts` to use PostgreSQL for sessions:
   ```typescript
   import connectPgSimple from 'connect-pg-simple';
   import { neon } from '@neondatabase/serverless';
   
   const PgSession = connectPgSimple(session);
   const sql = neon(process.env.DATABASE_URL!);
   
   app.use(session({
     store: new PgSession({
       pool: sql,
       tableName: 'session'
     }),
     secret: process.env.SESSION_SECRET || "...",
     // ... rest of config
   }));
   ```

2. **Option B: Redis/Upstash** (Best for high traffic)
   - Use Upstash Redis for session storage
   - See: [https://upstash.com](https://upstash.com)

---

## Part 4: Continuous Deployment

Vercel automatically redeploys when you push to your main branch:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Build your project
3. Deploy the new version
4. Keep the same URL

---

## Troubleshooting

### Database Connection Issues

- **Error: "DATABASE_URL is not set"**
  - Verify the environment variable is set in Vercel
  - Check for typos in the variable name

- **Error: "Connection refused"**
  - Ensure your Neon database is active
  - Check that the connection string includes `?sslmode=require`

### Build Failures

- **Error: "Command failed"**
  - Check the build logs in Vercel dashboard
  - Verify all dependencies are listed in `package.json`
  - Try building locally first: `npm run build`

### Session Issues

- **Users getting logged out frequently**
  - Implement PostgreSQL session store (see Post-Deployment Configuration)
  - Ensure `SESSION_SECRET` is set and consistent

### Performance Issues

- **Slow database queries**
  - Enable connection pooling in Neon
  - Add indexes to frequently queried columns (already included in migration)

---

## Monitoring & Maintenance

### Monitor Database Usage

1. Go to your Neon dashboard
2. Check **"Monitoring"** tab for:
   - Connection count
   - Query performance
   - Storage usage

### Check Vercel Logs

1. Go to your Vercel project
2. Click on a deployment
3. View **"Functions"** logs for API errors

### Backup Strategy

Neon provides automatic backups, but for critical data:
1. Consider setting up manual backups
2. Use `pg_dump` or Neon's built-in backup features
3. Test restore procedures regularly

---

## Security Checklist

- [ ] Changed default `SESSION_SECRET` to a strong random value
- [ ] Database connection string uses SSL (`?sslmode=require`)
- [ ] Environment variables are not committed to git
- [ ] `.env` file is in `.gitignore`
- [ ] Using HTTPS (Vercel provides this automatically)
- [ ] Implemented rate limiting (recommended for production)
- [ ] regularly update dependencies: `npm audit fix`

---

## Project Structure

```
dkit-dashboard/
├── client/              # React frontend
│   └── src/
│       ├── components/  # UI components
│       ├── pages/       # Page components
│       └── lib/         # Utilities
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database layer
│   └── vite.ts          # Vite integration
├── shared/              # Shared types & schemas
│   └── schema.ts        # Database schema & types
├── migrations/          # Database migrations
│   └── 0000_initial.sql # Initial schema
├── .env.example         # Environment template
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies
```

---

## Support & Resources

- **Neon Documentation**: https://neon.tech/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Drizzle ORM**: https://orm.drizzle.team/
- **Express.js**: https://expressjs.com/

---

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure email notifications for errors
3. Set up monitoring/alerts
4. Plan for scaling (Neon auto-scales, Vercel handles traffic)
5. Implement additional features as needed

Good luck with your deployment! 🚀
