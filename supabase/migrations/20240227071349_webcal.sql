create table "public"."user_calendars" (
    "id" bigint generated by default as identity not null,
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "webcal_id" text not null
);


alter table "public"."user_calendars" enable row level security;

CREATE UNIQUE INDEX user_calendars_pkey ON public.user_calendars USING btree (id);

alter table "public"."user_calendars" add constraint "user_calendars_pkey" PRIMARY KEY using index "user_calendars_pkey";

alter table "public"."user_calendars" add constraint "user_calendars_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_calendars" validate constraint "user_calendars_user_id_fkey";

grant delete on table "public"."user_calendars" to "anon";

grant insert on table "public"."user_calendars" to "anon";

grant references on table "public"."user_calendars" to "anon";

grant select on table "public"."user_calendars" to "anon";

grant trigger on table "public"."user_calendars" to "anon";

grant truncate on table "public"."user_calendars" to "anon";

grant update on table "public"."user_calendars" to "anon";

grant delete on table "public"."user_calendars" to "authenticated";

grant insert on table "public"."user_calendars" to "authenticated";

grant references on table "public"."user_calendars" to "authenticated";

grant select on table "public"."user_calendars" to "authenticated";

grant trigger on table "public"."user_calendars" to "authenticated";

grant truncate on table "public"."user_calendars" to "authenticated";

grant update on table "public"."user_calendars" to "authenticated";

grant delete on table "public"."user_calendars" to "service_role";

grant insert on table "public"."user_calendars" to "service_role";

grant references on table "public"."user_calendars" to "service_role";

grant select on table "public"."user_calendars" to "service_role";

grant trigger on table "public"."user_calendars" to "service_role";

grant truncate on table "public"."user_calendars" to "service_role";

grant update on table "public"."user_calendars" to "service_role";

create policy "Only auth user can access"
on "public"."user_calendars"
as permissive
for all
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



