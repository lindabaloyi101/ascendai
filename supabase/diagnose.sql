-- Ascend AI blog: read-only health check. Run in SQL Editor > New query. It changes nothing.
-- Expected when everything is right:
--   rls enabled ............ true
--   grant: anon ............ includes SELECT
--   grant: authenticated ... includes DELETE, INSERT, SELECT, UPDATE
--   5 policies (1 for public/anon select, 4 for authenticated: select, insert, update, delete)
--   columns: id, slug, title, excerpt, body, image_url, published, published_at, created_at, updated_at
--   storage bucket blog-images ... true

select 'rls enabled' as item, relrowsecurity::text as value from pg_class where oid = to_regclass('public.posts')
union all select 'TABLE public.posts', case when to_regclass('public.posts') is null then 'MISSING' else 'exists' end
union all select 'grant: ' || grantee, string_agg(privilege_type, ', ' order by privilege_type)
  from information_schema.role_table_grants
  where table_schema = 'public' and table_name = 'posts' and grantee in ('anon', 'authenticated') group by grantee
union all select 'policy: ' || policyname, cmd || ' to ' || array_to_string(roles, ',') from pg_policies where schemaname = 'public' and tablename = 'posts'
union all select 'column: ' || column_name, data_type from information_schema.columns where table_schema = 'public' and table_name = 'posts'
union all select 'posts in table', count(*)::text from public.posts
union all select 'posts published (visible on the blog)', count(*)::text from public.posts where published
union all select 'storage bucket blog-images (public?)', coalesce((select public::text from storage.buckets where id = 'blog-images'), 'MISSING')
order by 1;
