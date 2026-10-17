import { z } from 'zod';

export const ApplySchema = z.object({
  listingId: z.string().uuid(),
  coverLetter: z.string().max(2000).optional(),
});
export type ApplyDto = z.infer<typeof ApplySchema>;

export const UpdateStatusSchema = z.object({
  status: z.enum(['pending', 'viewed', 'accepted', 'rejected']),
});
export type UpdateStatusDto = z.infer<typeof UpdateStatusSchema>;
