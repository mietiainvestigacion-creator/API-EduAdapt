-- Anonymous student codes + per-student tutor profile paragraph

alter table public.class_students
  add column if not exists student_code text,
  add column if not exists tutor_profile text;

update public.class_students
set student_code = upper(trim(display_name))
where student_code is null or student_code = '';

alter table public.class_students
  alter column student_code set not null;

alter table public.class_students
  drop constraint if exists class_students_class_id_display_name_key;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'class_students_class_id_student_code_key'
  ) then
    alter table public.class_students
      add constraint class_students_class_id_student_code_key unique (class_id, student_code);
  end if;
end $$;

create index if not exists class_students_student_code_idx
  on public.class_students (student_code);

comment on column public.class_students.student_code is
  'Anonymous roster code from Explora-TIC (e.g. 024). Not a real name.';
comment on column public.class_students.tutor_profile is
  'Teacher-authored pedagogical profile paragraph injected into the tutor system prompt.';
