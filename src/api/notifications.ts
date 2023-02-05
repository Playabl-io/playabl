import { supabase } from "@/supabase";
import { Notification } from "@/typings/Notification";
import { log } from "@/util/logger";

export async function clearNotification(notification: Notification) {
  const { error } = await supabase
    .from("notifications")
    .update({
      ...notification,
      read: true,
    })
    .eq("id", notification.id);

  if (error) {
    log({ error });
    throw new Error(error.message);
  }
}
