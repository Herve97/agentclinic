import { z } from "zod";

// Decision D5: non-empty after trimming, and nothing else. Length caps and
// content rules belong to Phase 11; the remaining intake fields to Phase 2.
export const intakeSchema = z.object({
  complaint: z.string().trim().min(1, "A presenting complaint is required."),
});

export type Intake = z.infer<typeof intakeSchema>;
