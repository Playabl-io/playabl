ALTER TABLE community_access
ADD CONSTRAINT community_access_unique_user_and_access_level UNIQUE (user_id, access_level_id);
