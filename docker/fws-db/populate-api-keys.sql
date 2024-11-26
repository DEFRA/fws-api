TRUNCATE TABLE u_fws.api_key;

INSERT INTO u_fws.api_key(account_id, key, account_name, read, write, date_created, date_modified, modified_by) VALUES 
  ('dev-write', uuid_generate_v4(), 'Read and write account for local dev', true, true, '2024-11-25 16:10:30', '2024-11-25 16:10:30', 'developer'),
  ('dev-read', uuid_generate_v4(), 'Read account for local dev', true, false, '2024-11-25 16:10:30', '2024-11-25 16:10:30', 'developer'),
  ('dev-disable', uuid_generate_v4(), 'Disabled account for local dev', false, false, '2024-11-25 16:10:30', '2024-11-25 16:10:30', 'developer'),
  ('dev-write-only', uuid_generate_v4(), 'Write only account for local dev', false, true, '2024-11-25 16:10:30', '2024-11-25 16:10:30', 'developer');