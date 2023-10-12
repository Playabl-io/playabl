CREATE OR REPLACE FUNCTION "public"."cancel_game"("game_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$declare
  user_id uuid;
  profile record;
  game_name text;
begin
  select title from games into game_name where id = game_id;
  update games 
  set deleted_at = transaction_timestamp()
  where id = game_id;

  update sessions
  set deleted_at = transaction_timestamp()
  where sessions.game_id = cancel_game.game_id;

  for user_id in select distinct unnest(rsvps)::uuid from sessions where sessions.game_id = cancel_game.game_id
  loop
    select * from profiles into profile where id = user_id;
    perform add_game_cancel_to_notifications(profile.id, profile.username, profile.email, game_name);
  end loop;
end;$$;

ALTER FUNCTION "public"."cancel_game"("game_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."leave_session"("user_id" "text", "session_id" bigint) RETURNS "record"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
      perform add_rsvp_to_notifications(new_rsvp, user_name, user_email, game_title, format('https://app.playabl.io/games/%s', cur_game_id), format('Congrats! You are in for %L!', game_title));
    end if;
  end if;

  return results;
end;
$$;

ALTER FUNCTION "public"."leave_session"("user_id" "text", "session_id" bigint) OWNER TO "postgres";