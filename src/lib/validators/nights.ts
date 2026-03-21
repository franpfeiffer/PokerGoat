import { z } from "zod";

export const createNightSchema = z.object({
  name: z.string().max(200).optional(),
  date: z.string().min(1),
  chipValueBlack: z.coerce.number().positive(),
  chipValueWhite: z.coerce.number().positive(),
  chipValueRed: z.coerce.number().positive(),
  chipValueGreen: z.coerce.number().positive(),
  chipValueBlue: z.coerce.number().positive(),
  buyInAmount: z.coerce.number().positive(),
  maxRebuys: z.coerce.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
  chipQtyBlack: z.coerce.number().int().min(0).optional(),
  chipQtyWhite: z.coerce.number().int().min(0).optional(),
  chipQtyRed: z.coerce.number().int().min(0).optional(),
  chipQtyGreen: z.coerce.number().int().min(0).optional(),
  chipQtyBlue: z.coerce.number().int().min(0).optional(),
});

export const updateNightSchema = createNightSchema;

export const updateParticipantSchema = z.object({
  participantId: z.string().uuid(),
  buyInCount: z.coerce.number().int().min(1).optional(),
  customBuyInAmount: z.coerce.number().positive().optional(),
  clearCustomBuyIn: z.coerce.boolean().optional(),
  totalChipsEnd: z.coerce.number().int().min(0).optional(),
  chipsBlackEnd: z.coerce.number().int().min(0).optional(),
  chipsWhiteEnd: z.coerce.number().int().min(0).optional(),
  chipsRedEnd: z.coerce.number().int().min(0).optional(),
  chipsGreenEnd: z.coerce.number().int().min(0).optional(),
  chipsBlueEnd: z.coerce.number().int().min(0).optional(),
});

export type CreateNightInput = z.infer<typeof createNightSchema>;
