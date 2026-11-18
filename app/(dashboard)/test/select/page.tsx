import { requireExamContext } from '@/lib/exam-context';
import { createClient } from '@/lib/supabase/server';
import { getTestPool } from '@/lib/test-catalog';
import { TestSelectForm } from './test-select-form';
export const metadata = { title: 'New Test | StudentAce' };
export default async function TestSelectPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const query = await searchParams;
    const { user, exam, stream } = await requireExamContext();
    const supabase = await createClient();
    const pool = await getTestPool(exam.id, stream);
    const ids = [...new Set(pool.map(q => q.subject_id))];
    const [subjects, topics, pastSessionsResult] = await Promise.all([
        ids.length ? supabase.from('subjects').select('id,name').eq('exam_id', exam.id).eq('is_active', true).in('id', ids).order('name') : { data: [], error: null },
        ids.length ? supabase.from('topics').select('id,subject_id,parent_id,name').in('subject_id', ids).order('sort_order') : { data: [], error: null },
        user ? supabase.from('test_sessions').select('id, year, paper, status, completed_at, total_questions').eq('user_id', user.id).eq('exam_id', exam.id).order('completed_at', { ascending: false }) : { data: [], error: null },
    ]);
    if (subjects.error)
        throw subjects.error;
    if (topics.error)
        throw topics.error;
    const initialSelection = Object.fromEntries(Object.entries(query).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
    return (
        <TestSelectForm
            examId={exam.id}
            examName={exam.name}
            stream={stream}
            requiresStream={exam.requires_stream}
            subjects={subjects.data || []}
            topics={topics.data || []}
            pool={pool}
            initialSelection={initialSelection}
            pastSessions={pastSessionsResult.data || []}
        />
    );
}
