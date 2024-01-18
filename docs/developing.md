# Developing

Local development of Playabl uses Docker to run a containerized version of the backend alongside a local copy of the UI. The Netlify service is also supported locally and can be run to test serverless functions. There is also some AWS in the codebase, but Netlify is typically preferred for serverless functions.

## Supabase setup

The local workflow is based on Supabase's guide for [local development](https://supabase.com/docs/guides/cli/local-development) with supabase CLI.

### Storage (optional)

The storage buckets have to be manually created after any database setup or reset. After you've got the supabase CLI running and the application is started, you can go to the local supabase dashboard and create the storage buckets:

- cover-images
- avatars

Create each as a public bucket, with 1 MB upload limit.

Next, you have to add the RLS policies. For each bucket, you can do the quick start option and use the **Give users access to only their own top level folder named as uid** template. Enable all operations and save. This will allow each user full access to their own bucket which is stored under their ID. And since the buckets are public, anyone can read the contents.

### Replication

Realtime replication is not turned on by default and has to be manually activated. For development, this is optional, but turning on sessions table replication is useful when working on features involving game management to make sure you match prod behavior.

## Local user

There are two users seeded - a community admin and a player.`developer@playabl.io` is the admin, and `player@playbl.io` is the player. Both have the password `let-me-in-please`.

## Common development commands

The supabase CLI has several commands for interacting with the database that are helpful. [Find them here](https://supabase.com/docs/reference/cli/supabase-db).

Most other frequently needed commands are setup as package scripts, so see the [package.json](../package.json) for available commands.
