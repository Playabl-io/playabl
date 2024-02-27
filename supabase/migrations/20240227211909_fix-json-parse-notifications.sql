set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_rsvp_to_notifications(user_id uuid, user_name text, email text, game_name text, related_url text, message text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN
  INSERT INTO notifications (type, user_id, user_name, email, message, related_url, custom_fields)
  VALUES ('rsvp', user_id, user_name, email, message, related_url, 
          to_jsonb(json_build_object('game_name', game_name)));
END;$function$
;

CREATE OR REPLACE FUNCTION public.leave_session(user_id text, session_id bigint)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  results "sessions"%rowtype;
  length integer;
  count integer;
  cur_rsvp uuid;
  new_rsvp uuid;
  cur_game_id integer;
  game_title text;
  user_email text;
  user_name text;
begin
  if not exists (select * from sessions where id = session_id and user_id = ANY(rsvps)) then
    raise exception 'User not in session';
  end if;

  select array_length(rsvps, 1)
  into length
  from sessions
  where id = session_id
  and user_id = ANY(rsvps);
  select participant_count into count from sessions 
  where id = session_id;

  if length - 1 < count then
    update sessions set has_openings = true, rsvps = array_remove(rsvps, "user_id")
    where id = session_id
    returning * into results;
  else
    select rsvps[count]::uuid into cur_rsvp from sessions
    where id = session_id;
    update sessions set has_openings = false, rsvps = array_remove(rsvps, "user_id")
    where id = session_id
    returning * into results;
    select rsvps[count]::uuid, game_id
    into new_rsvp, cur_game_id from sessions
    where id = session_id;
    if cur_rsvp != new_rsvp then
      select title into game_title
      from games where id = cur_game_id;
      select email, username into user_email, user_name
      from profiles where id = new_rsvp;
      PERFORM add_rsvp_to_notifications(
        new_rsvp,
        user_name,
        user_email,
        game_title,
        format('https://app.playabl.io/games/%s', cur_game_id),
        format('Congrats! You are in for %L!', quote_literal(game_title))
      );
    end if;
  end if;

  return results;
end;
$function$
;


