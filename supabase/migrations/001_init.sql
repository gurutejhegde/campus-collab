-- CampusCollab Schema (Step 1: Auth, Profiles, Events, Event-Scoped & Standalone Teams, Requests)
-- Run this once in your Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'admin')),
  name text not null,
  avatar_url text,
  college text not null default '',
  department text not null default '',
  year int not null default 1 check (year between 1 and 5),
  bio text not null default '',
  skills jsonb not null default '[]'::jsonb,
  learning_goals text[] not null default '{}',
  preferred_domains text[] not null default '{}',
  weekly_availability int not null default 10 check (weekly_availability between 1 and 80),
  open_to_learning boolean not null default true,
  github_username text,
  github_overview jsonb,
  linkedin_url text,
  portfolio_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. EVENTS (Created by Admins)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  organizer text not null,
  category text not null check (category in ('hackathon', 'competition', 'workshop', 'conference', 'other')),
  format text not null check (format in ('online', 'offline', 'hybrid')),
  location text not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  registration_deadline timestamptz not null,
  registration_url text not null default '',
  tags text[] not null default '{}',
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 3. TEAMS (event_id NULL = Standalone Idea Team; event_id SET = Event-Scoped Team)
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  name text not null,
  description text not null,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  project_domain text not null,
  required_skills text[] not null default '{}',
  open_roles text[] not null default '{}',
  visibility text not null default 'open' check (visibility in ('open', 'invite_only')),
  learner_friendly boolean not null default true,
  max_members int not null default 4 check (max_members between 2 and 12),
  created_at timestamptz not null default now()
);

-- 4. TEAM MEMBERS
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'Member',
  joined_at timestamptz not null default now(),
  unique (team_id, user_id)
);

-- 5. TEAM REQUESTS (Invitations + Join Requests)
create table if not exists public.team_requests (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('invitation', 'join_request')),
  team_id uuid not null references public.teams(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  proposed_role text,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Prevent duplicate pending requests between the same pair for the same team
create unique index if not exists idx_unique_pending_request
  on public.team_requests (type, team_id, sender_id, recipient_id)
  where (status = 'pending');

-- SECURITY DEFINER HELPERS (Prevent RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_team_creator(p_team_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.teams
    where id = p_team_id and creator_id = auth.uid()
  );
$$;

create or replace function public.can_view_team(p_team_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.teams t
    where t.id = p_team_id
      and (
        t.visibility = 'open'
        or t.creator_id = auth.uid()
        or exists (
          select 1 from public.team_members tm
          where tm.team_id = t.id and tm.user_id = auth.uid()
        )
        or exists (
          select 1 from public.team_requests tr
          where tr.team_id = t.id
            and tr.type = 'invitation'
            and tr.recipient_id = auth.uid()
        )
      )
  );
$$;

-- Automatically prevent role self-escalation to admin on client insert/update
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' then
      new.role := 'student';
    elsif tg_op = 'UPDATE' and new.role is distinct from old.role then
      if not public.is_admin() then
        new.role := old.role;
      end if;
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
  before insert or update on public.profiles
  for each row execute function public.protect_profile_role();

-- Automatically add creator as initial team_member when creating a team
create or replace function public.add_creator_as_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.team_members (team_id, user_id, role)
  values (new.id, new.creator_id, 'Team Lead')
  on conflict (team_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_add_creator_as_member on public.teams;
create trigger trg_add_creator_as_member
  after insert on public.teams
  for each row execute function public.add_creator_as_member();

-- Atomically add member when a pending request is accepted
create or replace function public.handle_request_accepted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user uuid;
begin
  if new.status = 'accepted' and old.status = 'pending' then
    target_user := case when new.type = 'invitation' then new.recipient_id else new.sender_id end;
    insert into public.team_members (team_id, user_id, role)
    values (new.team_id, target_user, coalesce(nullif(new.proposed_role, ''), 'Member'))
    on conflict (team_id, user_id) do nothing;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_handle_request_accepted on public.team_requests;
create trigger trg_handle_request_accepted
  before update on public.team_requests
  for each row execute function public.handle_request_accepted();

-- ENABLE RLS
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.team_requests enable row level security;

-- PROFILES POLICIES
create policy "Profiles readable by authenticated users"
  on public.profiles for select to authenticated using (true);

create policy "Users can insert own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- EVENTS POLICIES (Admin only create/edit/delete)
create policy "Events readable by authenticated users"
  on public.events for select to authenticated using (true);

create policy "Admins can insert events"
  on public.events for insert to authenticated
  with check (public.is_admin() and created_by = auth.uid());

create policy "Admins can update events"
  on public.events for update to authenticated
  using (public.is_admin());

create policy "Admins can delete events"
  on public.events for delete to authenticated
  using (public.is_admin());

-- TEAMS POLICIES
create policy "Teams readable if open member or invited"
  on public.teams for select to authenticated
  using (public.can_view_team(id));

create policy "Students can create teams"
  on public.teams for insert to authenticated
  with check (creator_id = auth.uid());

create policy "Team creator can update team"
  on public.teams for update to authenticated
  using (creator_id = auth.uid());

create policy "Team creator can delete team"
  on public.teams for delete to authenticated
  using (creator_id = auth.uid());

-- TEAM MEMBERS POLICIES
create policy "Team members readable if team viewable"
  on public.team_members for select to authenticated
  using (public.can_view_team(team_id));

create policy "Member can leave or creator can remove"
  on public.team_members for delete to authenticated
  using (user_id = auth.uid() or public.is_team_creator(team_id));

-- TEAM REQUESTS POLICIES
create policy "Requests visible to sender or recipient"
  on public.team_requests for select to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "Users can create requests as sender"
  on public.team_requests for insert to authenticated
  with check (sender_id = auth.uid());

create policy "Sender can cancel or recipient can accept/reject"
  on public.team_requests for update to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid());
