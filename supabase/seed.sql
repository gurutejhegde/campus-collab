-- CampusCollab Test Seed (Users, Profiles, Events, Event-Scoped & Standalone Teams, Requests)
-- Run this in Supabase Dashboard -> SQL Editor AFTER running 001_init.sql.
-- All test accounts share password: Password123!

set search_path = public, auth, extensions;

-- Ensure SQL Editor / service-role scripts can seed admin roles while keeping client API protected
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

do $$
declare
  v_admin_id     uuid := '11111111-1111-4111-8111-111111111111';
  v_ananya_id    uuid := '22222222-2222-4222-8222-222222222222';
  v_rohan_id     uuid := '33333333-3333-4333-8333-333333333333';
  v_meera_id     uuid := '44444444-4444-4444-8444-444444444444';
  v_priyanshu_id uuid := '55555555-5555-4555-8555-555555555555';
  v_aditya_id    uuid := '66666666-6666-4666-8666-666666666666';

  v_event_sih    uuid := 'aaaa1111-1111-4111-8111-111111111111';
  v_event_oss    uuid := 'aaaa2222-2222-4222-8222-222222222222';
  v_event_expo   uuid := 'aaaa3333-3333-4333-8333-333333333333';

  v_team_agro    uuid := 'bbbb1111-1111-4111-8111-111111111111';
  v_team_grid    uuid := 'bbbb2222-2222-4222-8222-222222222222';
  v_team_medi    uuid := 'bbbb3333-3333-4333-8333-333333333333';
  v_team_aero    uuid := 'bbbb4444-4444-4444-8444-444444444444';
  v_team_cli     uuid := 'bbbb5555-5555-4555-8555-555555555555';

  v_pw_hash text := crypt('Password123!', gen_salt('bf'));
  v_rec record;
begin
  -- 1. Seed Auth Users + Identities (idempotent)
  for v_rec in
    select * from (values
      (v_admin_id,     'admin@campus.edu',     'Dr. Kavitha Rao'),
      (v_ananya_id,    'ananya@campus.edu',    'Ananya Sharma'),
      (v_rohan_id,     'rohan@campus.edu',     'Rohan Verma'),
      (v_meera_id,     'meera@campus.edu',     'Meera Krishnan'),
      (v_priyanshu_id, 'priyanshu@campus.edu', 'Priyanshu Das'),
      (v_aditya_id,    'aditya@campus.edu',    'Aditya Kulkarni')
    ) as t(uid, email, full_name)
  loop
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      v_rec.uid,
      'authenticated',
      'authenticated',
      v_rec.email,
      v_pw_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', v_rec.full_name),
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    on conflict (id) do nothing;

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      v_rec.uid,
      jsonb_build_object('sub', v_rec.uid::text, 'email', v_rec.email, 'email_verified', true),
      'email',
      v_rec.uid::text,
      now(),
      now(),
      now()
    )
    on conflict do nothing;
  end loop;

  -- 2. Seed Profiles (1 Admin + 5 Students)
  insert into public.profiles (
    id, role, name, college, department, year, bio,
    skills, learning_goals, preferred_domains, weekly_availability,
    open_to_learning, github_username, linkedin_url, portfolio_url, onboarding_completed
  ) values
  (
    v_admin_id, 'admin', 'Dr. Kavitha Rao',
    'Campus Innovation Cell, Bengaluru', 'Innovation & Hackathons Office', 5,
    'Faculty coordinator managing inter-college hackathons, workshops, and student team formations.',
    '[{"name":"Product Strategy","level":5},{"name":"Program Management","level":5}]'::jsonb,
    array['Developer Ecosystems'],
    array['EdTech', 'Social Impact'],
    10, false, null, null, null, true
  ),
  (
    v_ananya_id, 'student', 'Ananya Sharma',
    'BMS College of Engineering, Bengaluru', 'Computer Science & Engineering', 3,
    'Frontend architect and design systems builder. Looking for backend and IoT teammates for clean energy and developer tooling builds.',
    '[{"name":"React","level":4},{"name":"TypeScript","level":4},{"name":"Tailwind CSS","level":5},{"name":"Figma","level":4}]'::jsonb,
    array['Supabase', 'React Native', 'Expo'],
    array['CleanTech & Sustainability', 'Developer Tools'],
    15, true, 'ananya-sharma', 'https://linkedin.com/in/ananya-sharma-dev', 'https://ananya.design', true
  ),
  (
    v_rohan_id, 'student', 'Rohan Verma',
    'IIIT Bangalore', 'Artificial Intelligence & Data Science', 2,
    'Computer vision and edge ML builder exploring quantized models on Raspberry Pi and mobile devices.',
    '[{"name":"Python","level":4},{"name":"PyTorch","level":4},{"name":"ONNX","level":3},{"name":"FastAPI","level":3}]'::jsonb,
    array['React Native', 'Rust'],
    array['AI & Machine Learning', 'AgriTech', 'HealthTech'],
    14, false, 'rohan-verma-ai', 'https://linkedin.com/in/rohanverma-ml', null, true
  ),
  (
    v_meera_id, 'student', 'Meera Krishnan',
    'BMS College of Engineering, Bengaluru', 'Computer Science & Engineering', 1,
    'First-year builder shipping small React tools daily. Committed 18 hrs/wk and eager to learn mobile and Postgres on a real team.',
    '[{"name":"JavaScript","level":3},{"name":"React","level":2},{"name":"Tailwind CSS","level":3}]'::jsonb,
    array['TypeScript', 'React Native', 'PostgreSQL', 'Supabase'],
    array['AgriTech', 'EdTech', 'Mobile Apps'],
    18, true, 'meera-builds', null, null, true
  ),
  (
    v_priyanshu_id, 'student', 'Priyanshu Das',
    'RV College of Engineering, Bengaluru', 'Electronics & Communication', 4,
    'Embedded systems and ROS2 robotics lead. Building low-latency drone telemetry and hardware-software co-designs.',
    '[{"name":"C++","level":5},{"name":"Embedded C","level":4},{"name":"ROS2","level":4},{"name":"ESP32","level":4}]'::jsonb,
    array['Rust', 'WebAssembly'],
    array['Robotics & IoT', 'Hardware & Embedded'],
    12, false, 'priyanshu-das', null, null, true
  ),
  (
    v_aditya_id, 'student', 'Aditya Kulkarni',
    'PES University, Bengaluru', 'Information Science', 3,
    'Full-stack developer focused on crisp UX, Postgres schemas, and mobile MVPs for hackathons.',
    '[{"name":"TypeScript","level":4},{"name":"Next.js","level":4},{"name":"PostgreSQL","level":3},{"name":"Figma","level":3}]'::jsonb,
    array['Expo', 'PyTorch', 'FastAPI'],
    array['HealthTech', 'FinTech', 'Web & Full-Stack'],
    14, true, 'aditya-kulk', null, 'https://adityak.dev', true
  )
  on conflict (id) do nothing;

  -- 3. Seed Events (Created by Admin)
  insert into public.events (
    id, title, description, organizer, category, format, location,
    start_date, end_date, registration_deadline, registration_url, tags, created_by
  ) values
  (
    v_event_sih,
    'Smart India Hackathon Internal Round 2026',
    '36-hour campus hackathon selecting top student teams for national SIH problem statements across AgriTech, HealthTech, and CleanTech.',
    'BMSCE Innovation Cell',
    'hackathon', 'offline', 'Main Auditorium, Bull Temple Rd, Bengaluru',
    now() + interval '18 days', now() + interval '20 days', now() + interval '12 days',
    'https://sih.gov.in',
    array['AI & ML', 'AgriTech', 'HealthTech', 'IoT'],
    v_admin_id
  ),
  (
    v_event_oss,
    'Bengaluru Open-Source & Cloud Sprint',
    'Weekend build sprint focused on developer tooling, CLI utilities, and local-first web infrastructure.',
    'FOSS Campus Collective',
    'competition', 'hybrid', 'IIIT Bangalore & Discord',
    now() + interval '26 days', now() + interval '28 days', now() + interval '20 days',
    'https://fossunited.org',
    array['Open Source', 'TypeScript', 'Rust', 'DevTools'],
    v_admin_id
  ),
  (
    v_event_expo,
    'IEEE Robotics & Embedded Systems Expo',
    'Hardware-software prototype exhibition showcasing autonomous drones, sensor meshes, and edge telemetry.',
    'IEEE Student Branch',
    'workshop', 'offline', 'RVCE Robotics Lab, Bengaluru',
    now() + interval '35 days', now() + interval '36 days', now() + interval '28 days',
    'https://ieee.org',
    array['Robotics', 'ROS2', 'Embedded', 'C++'],
    v_admin_id
  )
  on conflict (id) do nothing;

  -- 4. Seed Teams (Event-Scoped + Standalone Idea Teams)
  insert into public.teams (
    id, event_id, name, description, creator_id, project_domain,
    required_skills, open_roles, visibility, learner_friendly, max_members
  ) values
  (
    v_team_agro, v_event_sih, 'AgroSense Edge',
    'Offline-first crop disease scanner running quantized vision models on budget Android phones for Karnataka farmers.',
    v_rohan_id, 'AgriTech',
    array['Python', 'PyTorch', 'ONNX', 'React Native', 'Expo'],
    array['Mobile Engineer', 'UI/UX Designer'],
    'open', true, 4
  ),
  (
    v_team_grid, null, 'PulseGrid',
    'Standalone idea team building a real-time hostel solar & microgrid monitoring dashboard with anomaly alerts.',
    v_ananya_id, 'CleanTech & Sustainability',
    array['TypeScript', 'React', 'Tailwind CSS', 'PostgreSQL', 'ESP32'],
    array['Backend Engineer', 'Embedded / IoT Engineer'],
    'open', true, 4
  ),
  (
    v_team_medi, v_event_sih, 'MediQueue AI',
    'Smart OPD triage and queue-time estimator for campus & community clinics.',
    v_aditya_id, 'HealthTech',
    array['TypeScript', 'Next.js', 'FastAPI', 'PostgreSQL'],
    array['ML / AI Engineer', 'Frontend Developer'],
    'open', true, 4
  ),
  (
    v_team_aero, v_event_expo, 'AeroMesh',
    'Low-latency UDP telemetry and swarm waypoint planner for autonomous inspection drones.',
    v_priyanshu_id, 'Robotics & IoT',
    array['C++', 'ROS2', 'Embedded C', 'TypeScript'],
    array['Full-Stack Developer', 'ML / AI Engineer'],
    'open', false, 5
  ),
  (
    v_team_cli, v_event_oss, 'DevTrace CLI',
    'Zero-config local request profiler and latency tracer for student hackathon APIs.',
    v_ananya_id, 'Developer Tools',
    array['TypeScript', 'Node.js', 'Docker'],
    array['Security Engineer'],
    'invite_only', false, 3
  )
  on conflict (id) do nothing;

  -- 5. Seed Additional Team Members (creators already added by trigger, add extra teammates)
  insert into public.team_members (team_id, user_id, role) values
    (v_team_agro, v_priyanshu_id, 'Hardware / Edge Advisor'),
    (v_team_grid, v_rohan_id, 'Data & Anomaly Pipeline')
  on conflict (team_id, user_id) do nothing;

  -- 6. Seed Pending Requests (so Requests Inbox works immediately!)
  insert into public.team_requests (
    id, type, team_id, sender_id, recipient_id, proposed_role, message, status
  ) values
  (
    'cccc1111-1111-4111-8111-111111111111',
    'join_request',
    v_team_agro,
    v_aditya_id,
    v_rohan_id,
    'Mobile Engineer',
    'Built two Expo camera apps and can own the offline React Native scan flow (14 hrs/wk).',
    'pending'
  ),
  (
    'cccc2222-2222-4222-8222-222222222222',
    'invitation',
    v_team_grid,
    v_ananya_id,
    v_meera_id,
    'Frontend Developer',
    'Saw your React work and 18h/wk commitment — would love to mentor you on TypeScript + Postgres charts!',
    'pending'
  )
  on conflict do nothing;
end $$;
