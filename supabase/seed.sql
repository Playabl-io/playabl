-- ROLES
INSERT INTO "public"."roles" ("id", "name") VALUES
	(1, 'Admin'),
	(2, 'Creator'),
	(3, 'Player');

-- USERS
INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at") VALUES
	('00000000-0000-0000-0000-000000000000', '6699279a-6e4f-4f16-a33a-da89440c60e8', 'authenticated', 'authenticated', 'developer@playabl.io', crypt('let-me-in-please', gen_salt('bf')), '2023-10-11 13:29:40.460296+00', NULL, '', NULL, '', NULL, '', '', NULL, '2023-10-11 13:29:40.46246+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-10-11 13:29:40.451705+00', '2023-10-11 13:29:40.465108+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
	('00000000-0000-0000-0000-000000000000', '7f087630-ae6f-4ab7-90a3-fca84c29df94', 'authenticated', 'authenticated', 'player@playabl.io', crypt('let-me-in-please', gen_salt('bf')), '2023-10-11 13:29:40.460296+00', NULL, '', NULL, '', NULL, '', '', NULL, '2023-10-11 13:29:40.46246+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-10-11 13:29:40.451705+00', '2023-10-11 13:29:40.465108+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);

-- PROFILES
UPDATE "public"."profiles" set username = 'Player Bob' where id = '7f087630-ae6f-4ab7-90a3-fca84c29df94';

-- COMMUNITIES
-- After community creation - db triggers handle creating default access and community owner access
INSERT INTO "public"."communities" ("created_at", "name", "description", "website", "allow_public_signup", "twitter", "facebook", "id", "owner_id", "discord", "patreon", "slack", "how_to_join", "code_of_conduct_url", "game_types", "cover_image", "furthest_posting_date", "support_email", "support_message_subscriptions", "stripe_account_id", "join_payment_link", "join_price_id", "join_payment_link_id", "url_short_name", "signup_method", "deleted_at", "banned_emails") VALUES
	('2023-10-12 08:53:54.657872+00', 'Grimlin Games', 'Where games are grim', 'https://app.playabl.io', NULL, '', '', '5bee3b3a-59c3-4272-ac16-079d37bd73fa', '6699279a-6e4f-4f16-a33a-da89440c60e8', '', '', '', '', '', '{Fantasy,"Rules light",Narrative}', NULL, NULL, '', NULL, NULL, NULL, NULL, NULL, NULL, 'REQUEST', NULL, NULL);

-- COMMUNITY MEMBERSHIP
-- Add second user
INSERT INTO "public"."community_memberships" ("created_at", "role_id", "community_id", "user_id") VALUES
	('2023-10-12 08:53:54.657872+00', 3, '5bee3b3a-59c3-4272-ac16-079d37bd73fa', '7f087630-ae6f-4ab7-90a3-fca84c29df94');

-- At this point, we have two users who are both members of the same community. One is Admin, one is player

-- GAMES
INSERT INTO "public"."games" ("id", "title", "description", "cover_image", "draft_state", "deleted_at", "community_id", "creator_id", "system", "virtual_tabletop", "will_be_recorded", "participant_count", "uses_safety_tools", "description_as_flat_text", "event_id") VALUES
	(1, 'Cold Iron', '"<p><strong>In space, no one can hear you scream</strong></p>"', NULL, 'published', NULL, '5bee3b3a-59c3-4272-ac16-079d37bd73fa', '6699279a-6e4f-4f16-a33a-da89440c60e8', 'ALIEN', '', true, 4, true, 'In space, no one can hear you scream', NULL);

-- SESSIONS
INSERT INTO "public"."sessions" ("id", "created_at", "start_time", "end_time", "game_id", "access_times", "creator_id", "has_openings", "participant_count", "community_id", "rsvps", "deleted_at") VALUES
	(1, '2023-10-12 09:04:40.551653+00', EXTRACT(EPOCH FROM NOW() + INTERVAL '8 HOURS') * 1000, EXTRACT(EPOCH FROM NOW() + INTERVAL '12 HOURS') * 1000, 1, '"{\"1\":{\"name\":\"All member access\",\"rsvpAvailableTime\":1697101500000,\"humanReadableRsvpTime\":\"10/12/2023, 11:05:00 AM\"}}"', '6699279a-6e4f-4f16-a33a-da89440c60e8', true, 4, '5bee3b3a-59c3-4272-ac16-079d37bd73fa', '{7f087630-ae6f-4ab7-90a3-fca84c29df94}', NULL);
