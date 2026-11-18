-- Revision loop fairness, Day 1 full mistake inclusion, and detailed analytics
begin;

-- 1. Remove the artificial 20-question cap on daily revision queues
alter table revision_private.daily_queues drop constraint if exists daily_queues_question_ids_check;

-- 2. Update enroll so that newly enrolled mistakes are due immediately on Day 1
create or replace function revision_private.enroll(p_user uuid, p_question uuid, p_reset boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.questions where id = p_question and not marks_to_all) then return; end if;
  insert into public.spaced_repetition(user_id, question_id, stage, interval_days, repetition_count, next_review_date)
  values (p_user::text, p_question, 1, 1, 0, revision_private.today())
  on conflict (user_id, question_id) do update set
    stage = 1, interval_days = 1, repetition_count = 0, mastered_at = null,
    next_review_date = revision_private.today()
  where p_reset or public.spaced_repetition.mastered_at is not null;
end $$;

-- 3. Update queue function to:
--    a) Include all due questions from the student's exam without artificial 6 or 20 cap
--    b) Prioritize student's stream, then common (null stream), then exam-wide questions
--    c) Dynamically append any newly enrolled mistakes to today's queue if accessed again
create or replace function revision_private.queue(p_exam uuid, p_stream uuid default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  u uuid := auth.uid(); d date := revision_private.today();
  s text := coalesce(p_stream::text, 'none');
  daily revision_private.daily_queues%rowtype;
  ids uuid[]; items jsonb; deferred integer;
  new_candidates uuid[];
begin
  if u is null then raise exception 'Unauthorized'; end if;
  perform pg_advisory_xact_lock(hashtextextended(u::text, 817));

  -- Collect all due questions for this student and exam, prioritizing current stream and common questions
  select coalesce(array_agg(id order by priority, stage, next_review_date, id), '{}') into ids from (
    select r.question_id as id, r.stage, r.next_review_date,
      case 
        when p_stream is not null and q.stream_id = p_stream then 0
        when q.stream_id is null then 1
        else 2
      end as priority
    from public.spaced_repetition r
    join public.questions q on q.id = r.question_id
    where r.user_id = u::text and r.mastered_at is null and r.next_review_date <= d
      and q.exam_id = p_exam and not q.marks_to_all
    order by priority, r.stage, r.next_review_date, r.question_id
    limit 200
  ) candidates;

  select * into daily from revision_private.daily_queues
    where user_id = u and review_day = d and exam_id = p_exam and scope = s for update;

  if not found then
    insert into revision_private.daily_queues(user_id, review_day, exam_id, scope, question_ids)
      values (u, d, p_exam, s, ids) returning * into daily;
  else
    -- Dynamically merge any newly enrolled mistakes into today's queue
    select coalesce(array_agg(c), '{}') into new_candidates
    from unnest(ids) c
    where not (c = any(daily.question_ids));

    if cardinality(new_candidates) > 0 then
      daily.question_ids := daily.question_ids || new_candidates;
      update revision_private.daily_queues set question_ids = daily.question_ids
      where user_id = u and review_day = d and exam_id = p_exam and scope = s;
    end if;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', r.id,
    'stage', r.stage,
    'interval_days', r.interval_days,
    'repetition_count', r.repetition_count,
    'next_review_date', r.next_review_date,
    'question', to_jsonb(q)
  ) order by idx.ordinality), '[]')
  into items from unnest(daily.question_ids) with ordinality idx(question_id, ordinality)
    join public.questions q on q.id = idx.question_id
    join public.spaced_repetition r on r.question_id = q.id and r.user_id = u::text
  where not (daily.results ? q.id::text) and not q.marks_to_all;

  select count(*) into deferred from public.spaced_repetition r join public.questions q on q.id = r.question_id
    where r.user_id = u::text and r.mastered_at is null and r.next_review_date <= d
      and q.exam_id = p_exam and not q.marks_to_all
      and not (q.id = any(daily.question_ids));

  return jsonb_build_object(
    'reviewDate', d,
    'questions', items,
    'summary', jsonb_build_object(
      'dueCount', jsonb_array_length(items),
      'deferredCount', deferred,
      'dailyCap', greatest(100, cardinality(daily.question_ids)),
      'completedCount', (select count(*) from jsonb_object_keys(daily.results)),
      'totalCount', cardinality(daily.question_ids),
      'xpEarned', daily.xp_earned,
      'queueComplete', cardinality(daily.question_ids) > 0 and (select count(*) from jsonb_object_keys(daily.results)) >= cardinality(daily.question_ids)
    )
  );
end $$;

-- 4. Clean up any unstarted single-stream frozen queues for today so all mistakes load
delete from revision_private.daily_queues
where review_day = revision_private.today() and (results = '{}'::jsonb or results is null);

commit;
