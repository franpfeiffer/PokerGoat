import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(2).max(150),
  description: z.string().max(500).optional(),
  defaultChipValue: z.coerce.number().positive().default(0.1),
  defaultBuyIn: z.coerce.number().positive().default(10),
  currency: z.string().length(3).default("EUR"),
});

export const updateGroupSchema = createGroupSchema.partial();

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(1).max(20),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
