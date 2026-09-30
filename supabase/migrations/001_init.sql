-- EduAdapt schema: teachers (Auth), classes, roster students, lessons, progress

create extension if not exists "pgcrypto";

-- Profiles (teachers)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'teacher' check (role = 'teacher'),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), ''),
    'teacher'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Classes
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  join_code text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index classes_teacher_id_idx on public.classes (teacher_id);
create index classes_join_code_idx on public.classes (join_code);

alter table public.classes enable row level security;

create policy "classes_select_own"
  on public.classes for select
  using (auth.uid() = teacher_id);

create policy "classes_insert_own"
  on public.classes for insert
  with check (auth.uid() = teacher_id);

create policy "classes_update_own"
  on public.classes for update
  using (auth.uid() = teacher_id);

create policy "classes_delete_own"
  on public.classes for delete
  using (auth.uid() = teacher_id);

-- Class roster (students without Auth accounts)
create table public.class_students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  display_name text not null,
  interest text check (interest is null or interest in ('videojuegos', 'deportes', 'musica', 'arte', 'ciencia')),
  pace text check (pace is null or pace in ('rapido', 'medio', 'reflexivo')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (class_id, display_name)
);

create index class_students_class_id_idx on public.class_students (class_id);

alter table public.class_students enable row level security;

create policy "class_students_teacher_all"
  on public.class_students for all
  using (
    exists (
      select 1 from public.classes c
      where c.id = class_students.class_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classes c
      where c.id = class_students.class_id and c.teacher_id = auth.uid()
    )
  );

-- Global lesson catalog
create table public.lessons (
  id text primary key,
  title text not null,
  objective text not null default '',
  competency text not null default '',
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  sort_order int not null default 0,
  pre_test_question text not null default '',
  pre_test_answer text not null default '',
  post_test_question text not null default '',
  post_test_answer text not null default '',
  created_at timestamptz not null default now()
);

alter table public.lessons enable row level security;

create policy "lessons_select_authenticated"
  on public.lessons for select
  to authenticated
  using (true);

-- Per-class lesson overrides
create table public.class_lessons (
  class_id uuid not null references public.classes (id) on delete cascade,
  lesson_id text not null references public.lessons (id) on delete cascade,
  enabled boolean not null default true,
  sort_order int,
  primary key (class_id, lesson_id)
);

alter table public.class_lessons enable row level security;

create policy "class_lessons_teacher_all"
  on public.class_lessons for all
  using (
    exists (
      select 1 from public.classes c
      where c.id = class_lessons.class_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classes c
      where c.id = class_lessons.class_id and c.teacher_id = auth.uid()
    )
  );

-- Progress
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.class_students (id) on delete cascade,
  lesson_id text not null references public.lessons (id) on delete cascade,
  stage text not null default 'pre-test'
    check (stage in ('pre-test', 'chat', 'post-test', 'reflection', 'summary', 'hub')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  pre_test_score int,
  post_test_score int,
  messages_count int not null default 0,
  reflection text,
  autonomy_level int not null default 0,
  motivation int not null default 0,
  difficulty_adjustment int not null default 0,
  updated_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

create index progress_student_id_idx on public.progress (student_id);

alter table public.progress enable row level security;

create policy "progress_teacher_select"
  on public.progress for select
  using (
    exists (
      select 1
      from public.class_students cs
      join public.classes c on c.id = cs.class_id
      where cs.id = progress.student_id and c.teacher_id = auth.uid()
    )
  );

-- Interaction logs
create table public.interaction_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.class_students (id) on delete cascade,
  lesson_id text references public.lessons (id) on delete set null,
  type text not null
    check (type in ('message', 'hint', 'pre-test', 'post-test', 'reflection', 'complete')),
  payload text,
  created_at timestamptz not null default now()
);

create index interaction_logs_student_id_idx on public.interaction_logs (student_id);
create index interaction_logs_created_at_idx on public.interaction_logs (created_at desc);

alter table public.interaction_logs enable row level security;

create policy "logs_teacher_select"
  on public.interaction_logs for select
  using (
    exists (
      select 1
      from public.class_students cs
      join public.classes c on c.id = cs.class_id
      where cs.id = interaction_logs.student_id and c.teacher_id = auth.uid()
    )
  );

-- Student sessions (cookie tokens; server/service-role only)
create table public.student_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.class_students (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index student_sessions_student_id_idx on public.student_sessions (student_id);
create index student_sessions_expires_at_idx on public.student_sessions (expires_at);

alter table public.student_sessions enable row level security;
-- No policies for authenticated users: only service role accesses this table.
