## Supabase setup

See [local development](https://supabase.com/docs/guides/cli/local-development) with supabase CLI.

### Storage

The storage buckets have to be manually created. After you've got the supabase CLI running and the application is started, you can go to the local supabase dashboard and create the storage buckets:

- cover-images
- avatars

Create each as a public bucket, with 1 MB upload limit.

Next, you have to add the RLS policies. For each bucket, you can do the quick start option and use the **Give users access to only their own a top level folder named as uid** template. Enable all operations and save. This will allow each user full access to their own bucket which is stored under their ID. And since the buckets are public, anyone can read the contents.
