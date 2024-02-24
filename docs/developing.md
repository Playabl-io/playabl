# Developing

Local development of Playabl uses Docker to run a containerized version of the backend alongside a local copy of the UI. The Netlify service is also supported locally and can be run to test serverless functions. There is also some AWS in the codebase, but Netlify is typically preferred for serverless functions.

## Environment setup

_Note: these steps have only been tested on M1 Mac. If you want to develop on Linux or Windows you may need to alter these commands_

**Prereqs**

- Docker
- Node v20 or greater

The local workflow is based on Supabase's guide for [local development](https://supabase.com/docs/guides/cli/local-development) with supabase CLI. It is **highly** recommended you read this guide and at least be familiar with its contents before starting. This guide has all the info you need for how to do various tasks like starting services, stopping services, resetting the DB, creating a migration, etc.

**Install packages**

`npm install`

**Start supabase**

`npx supabase start`

This will pull the docker images and start the containers. At the end of it, you will be given an output of URLs and keys to use for local development. Some of these will need to be set in a `.env` file. Here is a sample output:

```
Started supabase local development setup.

API URL: http://127.0.0.1:54321
GraphQL URL: http://127.0.0.1:54321/graphql/v1
DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
Studio URL: http://127.0.0.1:54323
Inbucket URL: http://127.0.0.1:54324
JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
anon key: <anon_key>
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

**Set env variables**

Set these values in a `.env` file at the root of the project:

```
VITE_SUPABASE_URL=<API_URL>
VITE_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_URL=<API_URL>
SUPABASE_SERVICE_ROLE=<service_role_key>
VITE_PLAYABL_URL=http://localhost:8888
```

You may see other environement variables in the code, but these aren't typically necessary for normal development. If you want to work on something that does require it, like AWS, I'll work with you to figure out the right values.

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
