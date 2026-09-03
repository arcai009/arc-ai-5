-- Add Pro+ and Ultra subscription tiers
ALTER TYPE "SubscriptionTier" ADD VALUE IF NOT EXISTS 'PRO_PLUS';
ALTER TYPE "SubscriptionTier" ADD VALUE IF NOT EXISTS 'ULTRA';
