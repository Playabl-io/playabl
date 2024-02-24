drop trigger if exists "send_notification" on "public"."notifications";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.dispatch_unread_notifications_emails()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$declare
  row record;
begin
for row in select p.id, n.email, p.username, count(n.email)
  from notifications n
  inner join profiles p
  on p.id = n.user_id
  and (p.email_preferences->>'email_enabled')::boolean is true
  and (p.email_preferences->>'unread_notifications_enabled')::boolean is true
  and n.read = false
  and n.created_at > current_timestamp - interval '1 day'
  group by (p.id, n.email, p.username)
  loop
    perform net.http_post(
    'https://app.playabl.io/.netlify/functions/unreadNotificationsEmail',
    jsonb_build_object(
      'user_id',
      row.id,
      'email',
      row.email,
      'username',
      row.username,
      'count',
      row.count
    ),
    '{}',
    jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', '2gCvGM1WXv2i5Y3LzDT6kZfUqzimkEzvmwn31CtiyWg2'
    ),
    5000
  );
  end loop;
end;$function$
;

CREATE TRIGGER send_notification AFTER INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://app.playabl.io/.netlify/functions/notify', 'POST', '{"Content-type":"application/json","Authorization":"2gCvGM1WXv2i5Y3LzDT6kZfUqzimkEzvmwn31CtiyWg2"}', '{}', '5000');


