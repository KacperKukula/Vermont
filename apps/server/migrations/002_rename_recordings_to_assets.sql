ALTER TABLE recordings RENAME TO assets;

ALTER TABLE assets RENAME CONSTRAINT recordings_pkey TO assets_pkey;
ALTER TABLE assets RENAME CONSTRAINT recordings_user_id_fkey TO assets_user_id_fkey;
ALTER TABLE assets RENAME CONSTRAINT recordings_object_key_key TO assets_object_key_key;
ALTER TABLE assets RENAME CONSTRAINT recordings_size_bytes_check TO assets_size_bytes_check;
ALTER TABLE assets RENAME CONSTRAINT recordings_status_check TO assets_status_check;

ALTER INDEX recordings_user_idx RENAME TO assets_user_idx;
