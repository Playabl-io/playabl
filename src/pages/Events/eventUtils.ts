import { z } from "zod";

export const communityEventSchema = z
  .object({
    community_id: z.string().uuid(),
    created_at: z.string().datetime({ offset: true }),
    deleted_at: z.string().datetime({ offset: true }).nullable(),
    description: z.string().nullable(),
    draft_state: z.enum(["PUBLISHED", "DRAFT"]),
    end_time: z.number(),
    event_access_levels: z.array(z.number()).nullable(),
    fixed_access_time: z.number().nullable(),
    id: z.number(),
    rsvp_model: z.enum(["FIXED", "NORMAL"]),
    start_time: z.number(),
    title: z.string().min(2),
  })
  .superRefine((val, ctx) => {
    if (val.end_time <= val.start_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must come after start time",
      });
    }
    if (val.rsvp_model === "FIXED") {
      if (!val.fixed_access_time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Fixed access time is required when rsvp mode is FIXED",
        });
      } else {
        if (val.fixed_access_time > val.end_time) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "RSVP time cannot be after event end time",
          });
        }
        if (val.fixed_access_time > val.start_time) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "RSVP time cannot be after event start time",
          });
        }
      }
    }
  });
