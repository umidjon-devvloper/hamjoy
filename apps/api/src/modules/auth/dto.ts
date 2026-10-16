import { z } from 'zod';

export const OtpSendSchema = z.object({
  phone: z.string().min(9).max(20),
});
export type OtpSendDto = z.infer<typeof OtpSendSchema>;

export const OtpVerifySchema = z.object({
  phone: z.string().min(9).max(20),
  code: z.string().length(6).regex(/^\d{6}$/),
  device: z.string().max(200).optional(),
});
export type OtpVerifyDto = z.infer<typeof OtpVerifySchema>;

export const RefreshSchema = z.object({
  refresh: z.string().min(10),
});
export type RefreshDto = z.infer<typeof RefreshSchema>;
