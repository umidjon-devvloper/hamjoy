import { z } from 'zod';

export const CreateListingSchema = z.object({
  type: z.enum(['job', 'rent', 'sale', 'service', 'worker_offer', 'car_sale', 'car_salon', 'free_give']),
  vertical: z.enum(['uy-joy', 'ish', 'avto', 'bepul']).optional(),
  categoryId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  title: z.string().min(3).max(140),
  description: z.string().max(5000).default(''),
  price: z
    .object({
      amount: z.number().nonnegative(),
      currency: z.enum(['UZS', 'USD']),
      negotiable: z.boolean().default(false),
    })
    .nullable()
    .optional(),
  geo: z.object({ lat: z.number(), lng: z.number() }).nullable().optional(),
  media: z
    .array(z.object({ url: z.string().url(), kind: z.enum(['image', 'video']).default('image') }))
    .max(20)
    .default([]),
  attrs: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}),
});
export type CreateListingDto = z.infer<typeof CreateListingSchema>;

export const UpdateListingSchema = CreateListingSchema.partial();
export type UpdateListingDto = z.infer<typeof UpdateListingSchema>;

export const SearchQuerySchema = z.object({
  q: z.string().max(200).optional(),
  vertical: z.enum(['uy-joy', 'ish', 'avto', 'bepul']).optional(),
  type: z.enum(['job', 'rent', 'sale', 'service', 'worker_offer', 'car_sale', 'car_salon', 'free_give']).optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  locationId: z.coerce.number().int().positive().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusKm: z.coerce.number().positive().max(500).optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
  currency: z.enum(['UZS', 'USD']).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type SearchQueryDto = z.infer<typeof SearchQuerySchema>;
