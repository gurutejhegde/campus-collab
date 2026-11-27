-- Run this once in Supabase SQL Editor to enforce invite-only team privacy at the database RLS level.

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

drop policy if exists "Teams readable by authenticated users" on public.teams;
drop policy if exists "Teams readable if open member or invited" on public.teams;
create policy "Teams readable if open member or invited"
  on public.teams for select to authenticated
  using (public.can_view_team(id));

drop policy if exists "Team members readable by authenticated users" on public.team_members;
drop policy if exists "Team members readable if team viewable" on public.team_members;
create policy "Team members readable if team viewable"
  on public.team_members for select to authenticated
  using (public.can_view_team(team_id));
