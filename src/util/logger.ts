import { PostgrestError } from "@supabase/supabase-js";

export function log({
  level = "error",
  error,
  message,
}: {
  level?: "error" | "info" | "warn";
  error?: Error | PostgrestError | unknown;
  message?: string;
}) {
  // @ts-expect-error unsure how to handle this
  if (error?.message === "JWT expired") {
    window.location.href = `/login?redirect=${window.location.href}`;
  }

  if (level === "error") {
    console.error(error || message);
  }
  if (level === "warn" || level === "info") {
    console.log(error || message);
  }
}
