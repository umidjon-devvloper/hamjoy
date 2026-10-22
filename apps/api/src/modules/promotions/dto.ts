import { z } from 'zod';

export const PromoTierSchema = z.enum(['bronze', 'silver', 'gold']);
export type PromoTier = z.infer<typeof PromoTierSchema>;

export const StartPromoSchema = z.object({
  listingId: z.string().uuid(),
  tier: PromoTierSchema,
});
export type StartPromoDto = z.infer<typeof StartPromoSchema>;

/**
 * Hard-coded tariff table (dev defaults). Durations in days, prices in UZS.
 * These will move to the admin panel once Click/Payme is wired.
 */
export const PROMO_TARIFFS = {
  bronze: { durationDays: 3, priceUzs: 15_000 },
  silver: { durationDays: 7, priceUzs: 40_000 },
  gold: { durationDays: 10, priceUzs: 90_000 },
} as const satisfies Record<PromoTier, { durationDays: number; priceUzs: number }>;
