-- Ascend AI blog: run this ONCE on an existing project (SQL Editor > New query > paste > Run).
-- Fixes "permission denied for table posts" on Supabase projects created after 30 May 2026,
-- where new tables are not exposed to the Data API until they are granted explicitly.
-- Safe to run more than once. It does not touch your posts.

grant select on table public.posts to anon;                              -- visitors can read (RLS limits them to published posts)
grant select, insert, update, delete on table public.posts to authenticated;  -- the signed-in admin can manage posts

-- Optional check: you should see 5 rows (anon: SELECT; authenticated: DELETE, INSERT, SELECT, UPDATE).
select grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'posts' and grantee in ('anon', 'authenticated') order by 1, 2;
