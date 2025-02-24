create table if not exists public.typing_users (
  user_id uuid references public.users(id) on delete cascade primary key,
  is_typing boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter publication supabase_realtime add table typing_users;