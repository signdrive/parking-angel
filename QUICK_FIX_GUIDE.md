# 🔧 Quick Fix for Subscription Sync Issues

## The Problem
- Email field exists in `user_subscriptions` table but doesn't get populated
- Profile plan not updating after payment
- Missing database columns and constraints

## The Solution

### Step 1: Run the Database Migration
1. Go to your **Supabase Dashboard** → **SQL Editor**
2. Copy and paste the contents of `fix-profile-sync.sql`
3. Click **Run** to execute the migration

### Step 2: Verify the Fix
Run this command to check if everything is working:
```bash
node diagnose-subscription-sync.js
```

You should see all ✅ checkmarks.

### Step 3: Test a Payment
1. Complete a test subscription payment
2. Check your profile - it should show the correct plan immediately
3. Verify the `user_subscriptions` table has the email populated

## What the Migration Does

1. **Creates subscription_tier enum** - Required for the profiles table
2. **Adds missing columns** - `subscription_tier`, `subscription_plan`, `subscription_status` 
3. **Fixes constraints** - Allows 'premium', 'pro', 'enterprise' values
4. **Creates sync functions** - Automates profile updates on payment
5. **Ensures email column** - Adds email to user_subscriptions if missing
6. **Syncs existing data** - Updates any mismatched profiles

## After Migration

### ✅ Automatic Email Population
- System fetches email from user profile if not in Stripe session
- `user_subscriptions.email` is always populated

### ✅ Automatic Profile Sync  
- Payment success → Profile updated immediately
- Webhook events → Profile stays in sync
- No manual intervention required

### ✅ Robust Error Handling
- Functions include fallback logic
- Comprehensive logging for debugging
- Graceful handling of edge cases

## Troubleshooting

### If migration fails:
- Check Supabase logs for specific errors
- Verify you have admin permissions
- Try running sections individually

### If email still not populating:
- Verify user has email in their profile
- Check payment verification logs
- Confirm Stripe session includes customer_email

### If profile not updating:
- Run diagnostic script to verify functions exist
- Check application logs for sync errors
- Test sync function manually in SQL editor

---

🎉 **Once the migration is complete, the subscription sync will be fully automated!**
