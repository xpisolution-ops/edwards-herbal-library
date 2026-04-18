# Deployment Instructions

Your app is now configured for production! It includes:
1. Supabase Authentication & Database
2. Stripe Checkout (via Vercel Serverless Functions)
3. 587 Automatically Generated Herbal Remedies!

## How to Deploy to Vercel

1. Create a free account at [Vercel](https://vercel.com).
2. Install the Vercel CLI on your computer (or just drag and drop this folder into the Vercel dashboard).
3. In your Vercel Dashboard, add the following **Environment Variables**:
   - `VITE_SUPABASE_URL` = `https://lrxqsfkyczvqhpueeeat.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbG...` (Your Supabase Anon Key)
   - `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
   - `STRIPE_SECRET_KEY` = `sk_test_...`
4. Click **Deploy**!

Vercel will automatically detect that this is a Vite app and will use the `api/` folder to host your secure Stripe backend!
