import { z } from "zod";

export const createNightSchema = z.object({
  name: z.string().max(200).optional(),
  date: z.string().min(1),
  chipValue: z.coerce.number().positive(),
  buyInAmount: z.coerce.number().positive(),
  maxRebuys: z.coerce.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateParticipantSchema = z.object({
  participantId: z.string().uuid(),
  buyInCount: z.coerce.number().int().min(1).optional(),
  totalChipsEnd: z.coerce.number().int().min(0).optional(),
});

export type CreateNightInput = z.infer<typeof createNightSchema>;
