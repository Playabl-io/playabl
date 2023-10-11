
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

ALTER SCHEMA "public" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION "public"."add_default_access"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare
  level record;
begin
  for level in select id, community_id, apply_on_join from access_levels
  where community_id = new.community_id and apply_on_join = true
  loop
    insert into public.community_access(user_id, community_id, access_level_id)
    values(new.user_id, new.community_id, level.id);
  end loop;
  return new;
end;$$;

ALTER FUNCTION "public"."add_default_access"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."add_game_cancel_to_notifications"("user_id" "uuid", "user_name" "text", "email" "text", "game_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  insert into notifications (type, user_id, user_name, email, custom_fields)
  values ('cancel', user_id, user_name, email, format('{ "game_name": "%L" }', game_name)::json);
end;$$;

ALTER FUNCTION "public"."add_game_cancel_to_notifications"("user_id" "uuid", "user_name" "text", "email" "text", "game_name" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."add_rsvp_to_notifications"("user_id" "uuid", "user_name" "text", "email" "text", "game_name" "text", "related_url" "text", "message" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$begin
  insert into notifications (type, user_id, user_name, email, message, related_url, custom_fields)
  values ('rsvp', user_id, user_name, email, message, related_url, format('{ "game_name": "%L" }', game_name)::json);
end;$$;

ALTER FUNCTION "public"."add_rsvp_to_notifications"("user_id" "uuid", "user_name" "text", "email" "text", "game_name" "text", "related_url" "text", "message" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."add_to_notifications"("user_id" "uuid", "message" "text", "related_url" "text", "email" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  insert into notifications (user_id, message, related_url, email)
  values (user_id, message, related_url, email);
end;$$;

ALTER FUNCTION "public"."add_to_notifications"("user_id" "uuid", "message" "text", "related_url" "text", "email" "text") OWNER TO "postgres";

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

  for user_id in select distinct unnest(rsvps) from sessions where sessions.game_id = cancel_game.game_id
  loop
    select * from profiles into profile where id = user_id;
    perform add_game_cancel_to_notifications(profile.id, profile.username, profile.email, game_name);
  end loop;
end;$$;

ALTER FUNCTION "public"."cancel_game"("game_id" bigint) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_membership_for_community_creator"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  insert into public.access_levels(name, community_id, priority_access_time, time_denomination, is_mandatory, apply_on_join)
  values ('All member access', new.id, 0, 'hours', true, true);
  insert into public.community_memberships(community_id, user_id, role_id)
  values (new.id, new.owner_id, 1);
  return new;
end;$$;

ALTER FUNCTION "public"."create_membership_for_community_creator"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."create_profile_for_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  insert into public.profiles(id, email)
  values(new.id, new.email);
  return new;
end;$$;

ALTER FUNCTION "public"."create_profile_for_user"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."dispatch_unread_notifications_emails"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare
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
    )
  );
  end loop;
end;$$;

ALTER FUNCTION "public"."dispatch_unread_notifications_emails"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."join_session"("user_id" "text", "session_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
declare
  length integer;
  count integer;
begin
  IF EXISTS (SELECT FROM sessions WHERE id = session_id AND user_id = ANY(rsvps)) THEN
    raise exception 'Already confirmed';
  END IF;

  select cardinality(rsvps)
  into length
  from sessions
  where id = session_id;
  select participant_count into count from sessions 
  where id = session_id;

  if length + 1 >= count then
    update sessions set has_openings = false, rsvps = array_append(rsvps, "user_id")
    where id = session_id;
  else
    update sessions set has_openings = true, rsvps = array_append(rsvps, "user_id")
    where id = session_id;
  end if;
end;
$$;

ALTER FUNCTION "public"."join_session"("user_id" "text", "session_id" bigint) OWNER TO "postgres";

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
  select array_length(rsvps, 1)
  into length
  from sessions
  where id = session_id;
  select participant_count into count from sessions 
  where id = session_id;

  if length - 1 < count then
    update sessions set has_openings = true, rsvps = array_remove(rsvps, "user_id")
    where id = session_id
    returning * into results;
  else
    select rsvps[count] into cur_rsvp from sessions
    where id = session_id;
    update sessions set has_openings = false, rsvps = array_remove(rsvps, "user_id")
    where id = session_id
    returning * into results;
    select rsvps[count], game_id
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

CREATE OR REPLACE FUNCTION "public"."remove_community_member_access"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare
  game_session record;
begin
  delete from community_access where
  community_id = old.community_id and
  user_id = old.user_id;

  update sessions set deleted_at = transaction_timestamp() where community_id = old.community_id and creator_id = old.user_id;

  update games set deleted_at = transaction_timestamp() where community_id = old.community_id and creator_id = old.user_id;

  for game_session in select * from sessions where old.user_id::varchar=ANY(rsvps) and community_id = old.community_id
  loop
    perform leave_session(old.user_id::varchar, game_session.id);
  end loop;
  return old;
end;$$;

ALTER FUNCTION "public"."remove_community_member_access"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."set_session_opening"("session_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  length integer;
  count integer;
begin
  select array_length(rsvps, 1)
  into length
  from sessions
  where id = session_id;
  select participant_count into count from sessions 
  where id = session_id;
  
  if length >= count then
    update sessions set has_openings = false
    where id = session_id;
  else
    update sessions set has_openings = true
    where id = session_id;
  end if;
end;
$$;

ALTER FUNCTION "public"."set_session_opening"("session_id" bigint) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."access_levels" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text",
    "priority_access_time" integer NOT NULL,
    "community_id" "uuid" NOT NULL,
    "time_denomination" "text" DEFAULT 'hours'::"text" NOT NULL,
    "is_mandatory" boolean DEFAULT false NOT NULL,
    "apply_on_join" boolean DEFAULT false NOT NULL
);

ALTER TABLE "public"."access_levels" OWNER TO "postgres";

ALTER TABLE "public"."access_levels" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."access_levels_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."communities" (
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "description" "text",
    "website" "text",
    "allow_public_signup" boolean,
    "twitter" "text",
    "facebook" "text",
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "discord" "text",
    "patreon" character varying,
    "slack" "text",
    "how_to_join" "text",
    "code_of_conduct_url" "text",
    "game_types" "text"[],
    "cover_image" "text",
    "furthest_posting_date" bigint,
    "support_email" "text",
    "support_message_subscriptions" "jsonb"[],
    "stripe_account_id" "text",
    "join_payment_link" "text",
    "join_price_id" "text",
    "join_payment_link_id" "text",
    "url_short_name" "text",
    "signup_method" "text" DEFAULT 'PUBLIC'::"text" NOT NULL,
    "deleted_at" timestamp with time zone,
    "banned_emails" "text"[]
);

ALTER TABLE "public"."communities" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."community_access" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "community_id" "uuid",
    "access_level_id" bigint
);

ALTER TABLE "public"."community_access" OWNER TO "postgres";

ALTER TABLE "public"."community_access" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."community_access_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."community_events" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "title" "text" NOT NULL,
    "description" "text",
    "start_time" bigint NOT NULL,
    "end_time" bigint NOT NULL,
    "rsvp_model" "text" NOT NULL,
    "event_access_levels" bigint[],
    "fixed_access_time" bigint,
    "community_id" "uuid",
    "draft_state" "text" DEFAULT 'DRAFT'::"text"
);

ALTER TABLE "public"."community_events" OWNER TO "postgres";

ALTER TABLE "public"."community_events" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."community_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."community_invites" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_revoked" boolean DEFAULT false NOT NULL,
    "community_id" "uuid" NOT NULL
);

ALTER TABLE "public"."community_invites" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."community_membership_requests" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "message" "text",
    "user_id" "uuid" NOT NULL,
    "community_id" "uuid" NOT NULL
);

ALTER TABLE "public"."community_membership_requests" OWNER TO "postgres";

ALTER TABLE "public"."community_membership_requests" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."community_membership_requests_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."community_memberships" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "role_id" bigint NOT NULL,
    "community_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);

ALTER TABLE "public"."community_memberships" OWNER TO "postgres";

ALTER TABLE "public"."community_memberships" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."community_memberships_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."flags" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "flag" "text" NOT NULL,
    "community_ids" "uuid"[],
    "user_ids" "uuid"[]
);

ALTER TABLE "public"."flags" OWNER TO "postgres";

ALTER TABLE "public"."flags" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."flags_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."game_details" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "detail_blocks" "json",
    "game_id" bigint
);

ALTER TABLE "public"."game_details" OWNER TO "postgres";

ALTER TABLE "public"."game_details" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."game_details_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."games" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "title" "text" NOT NULL,
    "description" "json",
    "cover_image" "text",
    "draft_state" "text",
    "deleted_at" timestamp with time zone,
    "community_id" "uuid" NOT NULL,
    "creator_id" "uuid" NOT NULL,
    "system" "text",
    "virtual_tabletop" "text",
    "will_be_recorded" boolean DEFAULT false,
    "participant_count" smallint NOT NULL,
    "uses_safety_tools" boolean,
    "description_as_flat_text" "text",
    "event_id" bigint
);

ALTER TABLE "public"."games" OWNER TO "postgres";

ALTER TABLE "public"."games" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."games_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."integrations" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "is_active" boolean NOT NULL,
    "endpoint" "text" NOT NULL,
    "name" "text" NOT NULL,
    "triggers" "json"[] NOT NULL,
    "community_id" "uuid" NOT NULL,
    "slack_access_token" "text",
    "type" "text" NOT NULL,
    "slack_configuration" "json"
);

ALTER TABLE "public"."integrations" OWNER TO "postgres";

ALTER TABLE "public"."integrations" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."integrations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "from" "uuid" NOT NULL,
    "to" "uuid"[] NOT NULL,
    "topic_type" "text" NOT NULL,
    "topic_id" "text" NOT NULL,
    "message" "text" NOT NULL,
    "record_type" "text"
);

ALTER TABLE "public"."messages" OWNER TO "postgres";

ALTER TABLE "public"."messages" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL,
    "message" "text",
    "related_url" "text",
    "read" boolean DEFAULT false,
    "email" "text",
    "type" "text",
    "custom_fields" "json",
    "user_name" "text"
);

ALTER TABLE "public"."notifications" OWNER TO "postgres";

ALTER TABLE "public"."notifications" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notifications_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text",
    "avatar_url" "text",
    "pronouns" "text",
    "website" "text",
    "twitter" "text",
    "bio" "text",
    "email" "text",
    "subscriptions" "text"[],
    "email_preferences" "jsonb" DEFAULT '{"email_enabled": true, "unread_notifications_enabled": true}'::"jsonb"
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL
);

ALTER TABLE "public"."roles" OWNER TO "postgres";

ALTER TABLE "public"."roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."sessions" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "start_time" bigint NOT NULL,
    "end_time" bigint NOT NULL,
    "game_id" bigint NOT NULL,
    "access_times" "json" NOT NULL,
    "creator_id" "uuid",
    "has_openings" boolean,
    "participant_count" smallint,
    "community_id" "uuid" NOT NULL,
    "rsvps" "text"[],
    "deleted_at" timestamp with time zone
);

ALTER TABLE "public"."sessions" OWNER TO "postgres";

ALTER TABLE "public"."sessions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."sessions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

ALTER TABLE ONLY "public"."access_levels"
    ADD CONSTRAINT "access_levels_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_community_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_name_key" UNIQUE ("name");

ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_url_short_name_key" UNIQUE ("url_short_name");

ALTER TABLE ONLY "public"."community_access"
    ADD CONSTRAINT "community_access_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."community_events"
    ADD CONSTRAINT "community_events_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."community_invites"
    ADD CONSTRAINT "community_invites_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."community_memberships"
    ADD CONSTRAINT "community_membership_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."community_membership_requests"
    ADD CONSTRAINT "community_membership_requests_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."community_memberships"
    ADD CONSTRAINT "community_user_constraint" UNIQUE ("community_id", "user_id");

ALTER TABLE ONLY "public"."flags"
    ADD CONSTRAINT "flags_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."game_details"
    ADD CONSTRAINT "game_details_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");

CREATE OR REPLACE TRIGGER "add_community_access_on_join" AFTER INSERT ON "public"."community_memberships" FOR EACH ROW EXECUTE FUNCTION "public"."add_default_access"();

CREATE OR REPLACE TRIGGER "create_membership_for_community_creator" AFTER INSERT ON "public"."communities" FOR EACH ROW EXECUTE FUNCTION "public"."create_membership_for_community_creator"();

CREATE OR REPLACE TRIGGER "remove_community_member" AFTER DELETE ON "public"."community_memberships" FOR EACH ROW EXECUTE FUNCTION "public"."remove_community_member_access"();

CREATE OR REPLACE TRIGGER "send_notification" AFTER INSERT ON "public"."notifications" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://app.playabl.io/.netlify/functions/notify', 'POST', '{"Content-type":"application/json","Authorization":"2gCvGM1WXv2i5Y3LzDT6kZfUqzimkEzvmwn31CtiyWg2"}', '{}', '1000');

ALTER TABLE ONLY "public"."access_levels"
    ADD CONSTRAINT "access_levels_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id");

ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."community_access"
    ADD CONSTRAINT "community_access_access_level_id_fkey" FOREIGN KEY ("access_level_id") REFERENCES "public"."access_levels"("id");

ALTER TABLE ONLY "public"."community_access"
    ADD CONSTRAINT "community_access_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id");

ALTER TABLE ONLY "public"."community_access"
    ADD CONSTRAINT "community_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."community_events"
    ADD CONSTRAINT "community_events_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."community_invites"
    ADD CONSTRAINT "community_invites_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id");

ALTER TABLE ONLY "public"."community_membership_requests"
    ADD CONSTRAINT "community_membership_requests_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."community_membership_requests"
    ADD CONSTRAINT "community_membership_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."community_memberships"
    ADD CONSTRAINT "community_memberships_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id");

ALTER TABLE ONLY "public"."community_memberships"
    ADD CONSTRAINT "community_memberships_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id");

ALTER TABLE ONLY "public"."community_memberships"
    ADD CONSTRAINT "community_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."game_details"
    ADD CONSTRAINT "game_details_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id");

ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id");

ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."games"
    ADD CONSTRAINT "games_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."community_events"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."integrations"
    ADD CONSTRAINT "integrations_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id");

ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."sessions"
    ADD CONSTRAINT "sessions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id");

CREATE POLICY "Access based on user ID" ON "public"."notifications" USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Admin can create" ON "public"."community_events" FOR INSERT WITH CHECK (("community_id" IN ( SELECT "community_memberships_1"."community_id"
   FROM "public"."community_memberships" "community_memberships_1"
  WHERE (("community_memberships_1"."user_id" = "auth"."uid"()) AND ("community_memberships_1"."role_id" = 1)))));

CREATE POLICY "Admin can delete" ON "public"."community_memberships" FOR DELETE USING (("community_id" IN ( SELECT "community_memberships_1"."community_id"
   FROM "public"."community_memberships" "community_memberships_1"
  WHERE (("community_memberships_1"."user_id" = "auth"."uid"()) AND ("community_memberships_1"."role_id" = 1)))));

CREATE POLICY "Admin can insert, update, and delete" ON "public"."access_levels" USING (("community_id" IN ( SELECT "community_memberships_1"."community_id"
   FROM "public"."community_memberships" "community_memberships_1"
  WHERE (("community_memberships_1"."user_id" = "auth"."uid"()) AND ("community_memberships_1"."role_id" = 1)))));

CREATE POLICY "Admin can insert, update, and delete" ON "public"."community_access" USING (("community_id" IN ( SELECT "community_memberships_1"."community_id"
   FROM "public"."community_memberships" "community_memberships_1"
  WHERE (("community_memberships_1"."user_id" = "auth"."uid"()) AND ("community_memberships_1"."role_id" = 1)))));

CREATE POLICY "Admin can insert, update, and delete" ON "public"."games" USING (("community_id" IN ( SELECT "community_memberships_1"."community_id"
   FROM "public"."community_memberships" "community_memberships_1"
  WHERE (("community_memberships_1"."user_id" = "auth"."uid"()) AND ("community_memberships_1"."role_id" = 1)))));

CREATE POLICY "Admin can insert, update, and delete in community" ON "public"."sessions" USING (("community_id" IN ( SELECT "community_memberships_1"."community_id"
   FROM "public"."community_memberships" "community_memberships_1"
  WHERE (("community_memberships_1"."user_id" = "auth"."uid"()) AND ("community_memberships_1"."role_id" = 1)))));

CREATE POLICY "Admin can manage" ON "public"."integrations" USING (("community_id" IN ( SELECT "community_memberships"."community_id"
   FROM "public"."community_memberships"
  WHERE (("community_memberships"."user_id" = "auth"."uid"()) AND ("community_memberships"."role_id" = 1)))));

CREATE POLICY "Admin can perform operations" ON "public"."community_invites" USING (("community_id" IN ( SELECT "community_memberships_1"."community_id"
   FROM "public"."community_memberships" "community_memberships_1"
  WHERE (("community_memberships_1"."user_id" = "auth"."uid"()) AND ("community_memberships_1"."role_id" = 1)))));

CREATE POLICY "Admin can update" ON "public"."communities" FOR UPDATE USING (("id" IN ( SELECT "community_memberships_1"."community_id"
   FROM "public"."community_memberships" "community_memberships_1"
  WHERE (("community_memberships_1"."user_id" = "auth"."uid"()) AND ("community_memberships_1"."role_id" = 1)))));

CREATE POLICY "Admin can update" ON "public"."community_memberships" FOR UPDATE USING (("community_id" IN ( SELECT "community_memberships_1"."community_id"
   FROM "public"."community_memberships" "community_memberships_1"
  WHERE (("community_memberships_1"."user_id" = "auth"."uid"()) AND ("community_memberships_1"."role_id" = 1)))));

CREATE POLICY "Admins can delete" ON "public"."community_membership_requests" FOR DELETE USING (("community_id" IN ( SELECT "community_memberships"."community_id"
   FROM "public"."community_memberships"
  WHERE (("community_memberships"."user_id" = "auth"."uid"()) AND ("community_memberships"."role_id" = 1)))));

CREATE POLICY "Admins can update" ON "public"."community_membership_requests" FOR UPDATE USING (("community_id" IN ( SELECT "community_memberships"."community_id"
   FROM "public"."community_memberships"
  WHERE (("community_memberships"."user_id" = "auth"."uid"()) AND ("community_memberships"."role_id" = 1)))));

CREATE POLICY "All can insert" ON "public"."community_membership_requests" FOR INSERT WITH CHECK (true);

CREATE POLICY "All can read" ON "public"."community_membership_requests" FOR SELECT USING (true);

CREATE POLICY "Anyone can insert if community is public" ON "public"."community_memberships" FOR INSERT WITH CHECK ((true IN ( SELECT "communities"."allow_public_signup"
   FROM "public"."communities"
  WHERE ("communities"."id" = "community_memberships"."community_id"))));

CREATE POLICY "Community owner can insert" ON "public"."community_memberships" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "communities"."owner_id"
   FROM "public"."communities"
  WHERE ("communities"."id" = "community_memberships"."community_id"))));

CREATE POLICY "Creator can do all" ON "public"."game_details" USING (("auth"."uid"() IN ( SELECT "games"."creator_id"
   FROM "public"."games"
  WHERE ("games"."id" = "game_details"."game_id"))));

CREATE POLICY "Creator can insert, update, and delete" ON "public"."games" USING (("community_id" IN ( SELECT "community_memberships_1"."community_id"
   FROM "public"."community_memberships" "community_memberships_1"
  WHERE (("community_memberships_1"."user_id" = "auth"."uid"()) AND ("community_memberships_1"."role_id" = 2))))) WITH CHECK (("auth"."uid"() = "creator_id"));

CREATE POLICY "Creators can insert, update, and delete sessions for their game" ON "public"."sessions" USING (("auth"."uid"() IN ( SELECT "games"."creator_id"
   FROM "public"."games"
  WHERE ("games"."id" = "sessions"."game_id")))) WITH CHECK (("auth"."uid"() IN ( SELECT "games"."creator_id"
   FROM "public"."games"
  WHERE ("games"."id" = "sessions"."game_id"))));

CREATE POLICY "Enable access to all users" ON "public"."access_levels" FOR SELECT USING (true);

CREATE POLICY "Enable access to all users" ON "public"."communities" FOR SELECT USING (true);

CREATE POLICY "Enable access to all users" ON "public"."community_invites" FOR SELECT USING (true);

CREATE POLICY "Enable access to all users" ON "public"."community_memberships" FOR SELECT USING (true);

CREATE POLICY "Enable access to all users" ON "public"."games" FOR SELECT USING (true);

CREATE POLICY "Enable access to all users" ON "public"."profiles" FOR SELECT USING (true);

CREATE POLICY "Enable access to all users" ON "public"."roles" FOR SELECT USING (true);

CREATE POLICY "Enable access to all users" ON "public"."sessions" FOR SELECT USING (true);

CREATE POLICY "Enable all for Jon" ON "public"."flags" USING (("auth"."uid"() = 'ad2de368-b123-4f76-899d-e0642c3f5358'::"uuid"));

CREATE POLICY "Enable delete for users based on user_id" ON "public"."community_membership_requests" FOR DELETE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Enable insert for authenticated users only" ON "public"."communities" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));

CREATE POLICY "Enable read access for all users" ON "public"."flags" FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on user_id" ON "public"."community_membership_requests" FOR UPDATE USING (("auth"."uid"() = "user_id"));

CREATE POLICY "Everyone can read" ON "public"."community_access" FOR SELECT USING (true);

CREATE POLICY "RSVP'd can see" ON "public"."game_details" FOR SELECT USING (("auth"."uid"() IN ( SELECT DISTINCT ("unnest"("sessions"."rsvps"))::"uuid" AS "unnest"
   FROM "public"."sessions"
  WHERE ("sessions"."game_id" = "game_details"."game_id"))));

CREATE POLICY "RSVPd can read" ON "public"."messages" FOR SELECT USING (("auth"."uid"() IN ( SELECT "unnest"("messages"."to") AS "unnest")));

CREATE POLICY "Read if you are creator or admin" ON "public"."community_events" FOR SELECT USING (("community_id" IN ( SELECT "community_memberships_1"."community_id"
   FROM "public"."community_memberships" "community_memberships_1"
  WHERE (("community_memberships_1"."user_id" = "auth"."uid"()) AND ("community_memberships_1"."role_id" = ANY (ARRAY[(1)::bigint, (2)::bigint]))))));

CREATE POLICY "Read published" ON "public"."community_events" FOR SELECT USING (("draft_state" = 'PUBLISHED'::"text"));

CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));

ALTER TABLE "public"."access_levels" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."communities" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."community_access" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."community_events" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."community_invites" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."community_membership_requests" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."community_memberships" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."flags" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."game_details" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."integrations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."add_default_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."add_default_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_default_access"() TO "service_role";

GRANT ALL ON FUNCTION "public"."add_game_cancel_to_notifications"("user_id" "uuid", "user_name" "text", "email" "text", "game_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_game_cancel_to_notifications"("user_id" "uuid", "user_name" "text", "email" "text", "game_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_game_cancel_to_notifications"("user_id" "uuid", "user_name" "text", "email" "text", "game_name" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."add_rsvp_to_notifications"("user_id" "uuid", "user_name" "text", "email" "text", "game_name" "text", "related_url" "text", "message" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_rsvp_to_notifications"("user_id" "uuid", "user_name" "text", "email" "text", "game_name" "text", "related_url" "text", "message" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_rsvp_to_notifications"("user_id" "uuid", "user_name" "text", "email" "text", "game_name" "text", "related_url" "text", "message" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."add_to_notifications"("user_id" "uuid", "message" "text", "related_url" "text", "email" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_to_notifications"("user_id" "uuid", "message" "text", "related_url" "text", "email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_to_notifications"("user_id" "uuid", "message" "text", "related_url" "text", "email" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."cancel_game"("game_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."cancel_game"("game_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."cancel_game"("game_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."create_membership_for_community_creator"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_membership_for_community_creator"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_membership_for_community_creator"() TO "service_role";

GRANT ALL ON FUNCTION "public"."create_profile_for_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."create_profile_for_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_profile_for_user"() TO "service_role";

GRANT ALL ON FUNCTION "public"."dispatch_unread_notifications_emails"() TO "anon";
GRANT ALL ON FUNCTION "public"."dispatch_unread_notifications_emails"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."dispatch_unread_notifications_emails"() TO "service_role";

GRANT ALL ON FUNCTION "public"."join_session"("user_id" "text", "session_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."join_session"("user_id" "text", "session_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."join_session"("user_id" "text", "session_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."leave_session"("user_id" "text", "session_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."leave_session"("user_id" "text", "session_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."leave_session"("user_id" "text", "session_id" bigint) TO "service_role";

GRANT ALL ON FUNCTION "public"."remove_community_member_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."remove_community_member_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_community_member_access"() TO "service_role";

GRANT ALL ON FUNCTION "public"."set_session_opening"("session_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."set_session_opening"("session_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_session_opening"("session_id" bigint) TO "service_role";

GRANT ALL ON TABLE "public"."access_levels" TO "anon";
GRANT ALL ON TABLE "public"."access_levels" TO "authenticated";
GRANT ALL ON TABLE "public"."access_levels" TO "service_role";

GRANT ALL ON SEQUENCE "public"."access_levels_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."access_levels_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."access_levels_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."communities" TO "anon";
GRANT ALL ON TABLE "public"."communities" TO "authenticated";
GRANT ALL ON TABLE "public"."communities" TO "service_role";

GRANT ALL ON TABLE "public"."community_access" TO "anon";
GRANT ALL ON TABLE "public"."community_access" TO "authenticated";
GRANT ALL ON TABLE "public"."community_access" TO "service_role";

GRANT ALL ON SEQUENCE "public"."community_access_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."community_access_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."community_access_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."community_events" TO "anon";
GRANT ALL ON TABLE "public"."community_events" TO "authenticated";
GRANT ALL ON TABLE "public"."community_events" TO "service_role";

GRANT ALL ON SEQUENCE "public"."community_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."community_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."community_events_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."community_invites" TO "anon";
GRANT ALL ON TABLE "public"."community_invites" TO "authenticated";
GRANT ALL ON TABLE "public"."community_invites" TO "service_role";

GRANT ALL ON TABLE "public"."community_membership_requests" TO "anon";
GRANT ALL ON TABLE "public"."community_membership_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."community_membership_requests" TO "service_role";

GRANT ALL ON SEQUENCE "public"."community_membership_requests_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."community_membership_requests_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."community_membership_requests_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."community_memberships" TO "anon";
GRANT ALL ON TABLE "public"."community_memberships" TO "authenticated";
GRANT ALL ON TABLE "public"."community_memberships" TO "service_role";

GRANT ALL ON SEQUENCE "public"."community_memberships_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."community_memberships_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."community_memberships_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."flags" TO "anon";
GRANT ALL ON TABLE "public"."flags" TO "authenticated";
GRANT ALL ON TABLE "public"."flags" TO "service_role";

GRANT ALL ON SEQUENCE "public"."flags_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."flags_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."flags_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."game_details" TO "anon";
GRANT ALL ON TABLE "public"."game_details" TO "authenticated";
GRANT ALL ON TABLE "public"."game_details" TO "service_role";

GRANT ALL ON SEQUENCE "public"."game_details_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."game_details_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."game_details_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."games" TO "anon";
GRANT ALL ON TABLE "public"."games" TO "authenticated";
GRANT ALL ON TABLE "public"."games" TO "service_role";

GRANT ALL ON SEQUENCE "public"."games_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."games_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."games_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."integrations" TO "anon";
GRANT ALL ON TABLE "public"."integrations" TO "authenticated";
GRANT ALL ON TABLE "public"."integrations" TO "service_role";

GRANT ALL ON SEQUENCE "public"."integrations_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."integrations_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."integrations_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";

GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";

GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notifications_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";

GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";

GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."sessions" TO "anon";
GRANT ALL ON TABLE "public"."sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."sessions" TO "service_role";

GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."sessions_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
