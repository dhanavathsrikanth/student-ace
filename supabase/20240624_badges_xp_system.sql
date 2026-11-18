-- ============================================================
-- Badges & XP Management System
-- Adds badge_definitions, level_thresholds, xp_rules tables
-- ============================================================

-- 1. badge_definitions
create table if not exists public.badge_definitions (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text not null default '',
  icon_emoji      text not null default '🏆',
  condition_type  text not null default 'streak_days',
  condition_value integer not null default 0,
  xp_reward       integer not null default 0,
  slug            text not null unique,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 2. level_thresholds
create table if not exists public.level_thresholds (
  level       integer primary key,
  name        text not null,
  xp_required integer not null,
  updated_at  timestamptz not null default now()
);

-- 3. xp_rules
create table if not exists public.xp_rules (
  id          uuid primary key default gen_random_uuid(),
  event_key   text not null unique,
  label       text not null,
  description text,
  amount      integer not null,
  updated_at  timestamptz not null default now()
);

-- 4. Indexes
create index if not exists idx_badge_definitions_slug on public.badge_definitions(slug);
create index if not exists idx_badge_definitions_active on public.badge_definitions(is_active);

-- 5. Updated-at trigger for badge_definitions
create trigger trg_badge_definitions_updated_at
  before update on public.badge_definitions
  for each row
  execute function public.set_updated_at();

-- 6. Updated-at trigger for level_thresholds
create trigger trg_level_thresholds_updated_at
  before update on public.level_thresholds
  for each row
  execute function public.set_updated_at();

-- 7. Updated-at trigger for xp_rules
create trigger trg_xp_rules_updated_at
  before update on public.xp_rules
  for each row
  execute function public.set_updated_at();

-- 8. Row Level Security
alter table public.badge_definitions  enable row level security;
alter table public.level_thresholds   enable row level security;
alter table public.xp_rules           enable row level security;

-- badge_definitions policies
create policy "Badge definitions are readable by all authenticated users"
  on public.badge_definitions for select
  to authenticated
  using (true);

create policy "Admins can insert badge definitions"
  on public.badge_definitions for insert
  to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can update badge definitions"
  on public.badge_definitions for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can delete badge definitions"
  on public.badge_definitions for delete
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- level_thresholds policies
create policy "Level thresholds are readable by all authenticated users"
  on public.level_thresholds for select
  to authenticated
  using (true);

create policy "Admins can update level thresholds"
  on public.level_thresholds for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can insert level thresholds"
  on public.level_thresholds for insert
  to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- xp_rules policies
create policy "XP rules are readable by all authenticated users"
  on public.xp_rules for select
  to authenticated
  using (true);

create policy "Admins can update XP rules"
  on public.xp_rules for update
  to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can insert XP rules"
  on public.xp_rules for insert
  to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- 9. Seed data

-- Seed badge definitions (Prestigious Medals of Merit & Commendation Citations)
insert into public.badge_definitions (name, description, icon_emoji, condition_type, condition_value, xp_reward, slug, is_active) values
  ('Commissioning Scroll', 'Completed your first full simulation under timed exam conditions', '🎯', 'tests_completed', 1, 100, 'first_test', true),
  ('Vanguard Citation', 'Maintained an unbroken 7-day operational practice streak', '🔥', 'streak_days', 7, 150, 'week_warrior', true),
  ('Sharpshooter Insignia', 'Achieved 100% precision on a test assessment', '💯', 'perfect_scores', 1, 200, 'perfect_score', true),
  ('Centurion Citation', 'Answered 100 verified examination questions correctly', '⚔️', 'questions_correct', 100, 250, 'centurion', true),
  ('Iron Discipline Medal', 'Maintained a 30-day unwavering daily study streak', '🛡️', 'streak_days', 30, 500, 'iron_will', true),
  ('Regimental Mastery', 'Achieved 80%+ accuracy across all syllabus subjects', '🎓', 'all_subjects_mastered', 80, 1000, 'subject_master', true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon_emoji = excluded.icon_emoji,
  xp_reward = excluded.xp_reward;

-- Seed level thresholds (Dignified Commissioned Officer Ranks)
insert into public.level_thresholds (level, name, xp_required) values
  (0, 'Officer Cadet', 0),
  (1, 'Lieutenant', 500),
  (2, 'Captain', 1500),
  (3, 'Major', 3500),
  (4, 'Colonel', 7000),
  (5, 'Brigadier', 12000),
  (6, 'General', 20000)
on conflict (level) do update set
  name = excluded.name,
  xp_required = excluded.xp_required;

-- Seed XP rules (matching XP_REWARDS in lib/xp.ts)
insert into public.xp_rules (event_key, label, description, amount) values
  ('correct_answer', 'Correct Answer', 'Standard tactical reward per correct question', 10),
  ('high_accuracy_bonus', 'High Accuracy Bonus', 'Awarded for >=80% accuracy in tests with >=10 questions', 50),
  ('perfect_score_bonus', 'Sharpshooter Bonus', 'Awarded for achieving 100% accuracy in tests with >=5 questions', 100),
  ('full_mock_completed', 'Full Mock Stamina Bonus', 'Awarded for completing full-length test with >=30 questions', 150),
  ('mini_mock_completed', 'Sprint Mock Bonus', 'Awarded for completing sprint test with >=15 questions', 50),
  ('daily_question_correct', 'Daily Recon Correct', 'Solving the daily tactical question correctly', 25),
  ('daily_question_attempted', 'Daily Recon Attempted', 'Attempting the daily tactical question', 10),
  ('week_warrior_streak', 'Vanguard 7-Day Streak', '7-day operational practice streak milestone', 150),
  ('iron_will_streak', 'Iron Discipline 30-Day Streak', '30-day unwavering study streak milestone', 500),
  ('first_test_bonus', 'Commissioning Test Bonus', 'Completing your inaugural examination simulation', 100)
on conflict (event_key) do update set
  label = excluded.label,
  description = excluded.description,
  amount = excluded.amount;
