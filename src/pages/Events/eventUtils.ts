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

const eventFormBase = z.object({
  community_id: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().optional(),
  draft_state: z.enum(["DRAFT", "PUBLISHED"]),
  start_time: z.number(),
  end_time: z.number(),
  rsvp_model: z.enum(["FIXED", "NORMAL"]),
  event_access_levels: z.array(z.number()).nullable(),
  fixed_access_time: z.number().nullable(),
});
export const eventFormUpdateSchema = eventFormBase
  .extend({ id: z.number() })
  .superRefine((val, ctx) => {
    const now = new Date().getTime();
    if (val.end_time <= val.start_time) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must come after start time",
      });
    }
    if (val.start_time < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Start time must be in the future",
      });
    }
    if (val.end_time < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be in the future",
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
        if (val.fixed_access_time < now) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "RSVP time must be in the future",
          });
        }
      }
    }
  });
export const eventFormSchema = eventFormBase.superRefine((val, ctx) => {
  const now = new Date().getTime();
  if (val.end_time <= val.start_time) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must come after start time",
    });
  }
  if (val.start_time < now) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Start time must be in the future",
    });
  }
  if (val.end_time < now) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End time must be in the future",
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
      if (val.fixed_access_time < now) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "RSVP time must be in the future",
        });
      }
    }
  }
});
