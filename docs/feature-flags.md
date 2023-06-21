# Feature flags

The app supports a basic feature flag mechanism for developing and incremental release.

Within Supabase, there is a `flags` table. Each flag has a name, poorly called "flag", and a list of user_ids and community_ids for which the flag is enabled.

One example flag is the "flags_ui" which controls access to a dev page of the app on the `/flags` route. If your user has been given this flag, you can go to this route and enable / disable flags from the UI. Note that the value is not persisted in the database, so any refresh will clear it.

## Using flags in code

Flags are loaded on app mount and kept in the root level store. Currently, only user enabled flags are loaded in `App.vue`. When adding a flag, it's value should be added to `flags.ts` so that it can be referenced elsewhere.

Checking if a flag is enabled is as simple as looking to see if the flag value (from `flags.ts`) is set to true in the store.

Communities will leverage this same model by loading flags for the community on mount, and keeping this information in the community store. It will be important to clear this on unmount as well.
