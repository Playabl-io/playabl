--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at") VALUES
	('00000000-0000-0000-0000-000000000000', '6699279a-6e4f-4f16-a33a-da89440c60e8', 'authenticated', 'authenticated', 'developer@playabl.io', crypt('let-me-in-please', gen_salt('bf')), '2023-10-11 13:29:40.460296+00', NULL, '', NULL, '', NULL, '', '', NULL, '2023-10-11 13:29:40.46246+00', '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-10-11 13:29:40.451705+00', '2023-10-11 13:29:40.465108+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);

INSERT INTO "public"."roles" ("id", "name") VALUES
	(1, 'Admin'),
	(2, 'Creator'),
	(3, 'Player');