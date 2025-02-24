create table if not exists public.rooms (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references public.users(id) on delete set null
);

create table if not exists public.room_members (
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (room_id, user_id)
);

alter table public.messages add column room_id uuid references public.rooms(id) on delete cascade;

alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table room_members;