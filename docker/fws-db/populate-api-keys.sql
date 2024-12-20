DO $$
DECLARE
  modified_by CONSTANT TEXT := 'developer';
BEGIN
  TRUNCATE TABLE u_fws.api_key;

  INSERT INTO u_fws.api_key(account_id, key, account_name, read, write, date_created, date_modified, modified_by) VALUES
    ('dev-write', uuid_generate_v4(), 'Read and write account for local dev', true, true, NOW() AT  TIME ZONE 'UTC', NOW() AT  TIME ZONE 'UTC', modified_by),
    ('dev-read', uuid_generate_v4(), 'Read account for local dev', true, false, NOW() AT  TIME ZONE 'UTC', NOW() AT  TIME ZONE 'UTC', modified_by),
    ('dev-disable', uuid_generate_v4(), 'Disabled account for local dev', false, false, NOW() AT  TIME ZONE 'UTC', NOW() AT  TIME ZONE 'UTC', modified_by),
    ('dev-write-only', uuid_generate_v4(), 'Write only account for local dev', false, true, NOW() AT  TIME ZONE 'UTC', NOW() AT  TIME ZONE 'UTC', modified_by);
END $$;
