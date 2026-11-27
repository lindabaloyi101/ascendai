-- Ascend AI blog: run this once in Supabase (SQL Editor > New query > paste > Run).

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  image_url text not null default '',
  published boolean not null default false,
  published_at date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists posts_updated on public.posts;
create trigger posts_updated before update on public.posts for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

-- Data API access. Supabase projects created after 30 May 2026 do NOT expose new tables automatically,
-- so these grants are required or the site gets "permission denied for table posts".
-- Row Level Security (the policies below) still decides which rows each role may see or change.
grant select on table public.posts to anon;
grant select, insert, update, delete on table public.posts to authenticated;
drop policy if exists "Anyone can read published posts" on public.posts;
drop policy if exists "Admin can read all posts" on public.posts;
drop policy if exists "Admin can add posts" on public.posts;
drop policy if exists "Admin can change posts" on public.posts;
drop policy if exists "Admin can delete posts" on public.posts;
create policy "Anyone can read published posts" on public.posts for select using (published = true);
create policy "Admin can read all posts" on public.posts for select to authenticated using (true);
create policy "Admin can add posts" on public.posts for insert to authenticated with check (true);
create policy "Admin can change posts" on public.posts for update to authenticated using (true) with check (true);
create policy "Admin can delete posts" on public.posts for delete to authenticated using (true);

-- Image storage (public to read, admin only to change)
insert into storage.buckets (id, name, public) values ('blog-images', 'blog-images', true) on conflict (id) do nothing;
drop policy if exists "Anyone can view blog images" on storage.objects;
drop policy if exists "Admin can add blog images" on storage.objects;
drop policy if exists "Admin can change blog images" on storage.objects;
drop policy if exists "Admin can delete blog images" on storage.objects;
create policy "Anyone can view blog images" on storage.objects for select using (bucket_id = 'blog-images');
create policy "Admin can add blog images" on storage.objects for insert to authenticated with check (bucket_id = 'blog-images');
create policy "Admin can change blog images" on storage.objects for update to authenticated using (bucket_id = 'blog-images');
create policy "Admin can delete blog images" on storage.objects for delete to authenticated using (bucket_id = 'blog-images');

-- Sample post (edit or delete it from the admin page)
insert into public.posts (slug, title, excerpt, body, image_url, published, published_at) values (
  'welcome-to-the-ascend-ai-blog',
  'Welcome to the Ascend AI blog',
  'Where we share practical ideas for saving your team time with AI, automation and custom software.',
  E'Most businesses don''t need a big AI programme. They need one slow, repetitive process fixed well.\n\n## Where to start\n\nLook for work that is:\n\n- repeated every week\n- done by hand across several tools\n- a regular source of errors or delays\n\n## What we do\n\nWe map the process, **automate the steps that don''t need a person**, and keep people in charge of decisions.\n\nIf you''d like to talk it through, [book a call](../../contact/index.html).',
  'assets/img/blog/welcome-to-the-ascend-ai-blog.jpg', true, '2026-11-25'
) on conflict (slug) do nothing;
