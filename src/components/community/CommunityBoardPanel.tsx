import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { isFirebaseConfigured } from '../../firebase';
import { createPost, listPosts } from '../../services/postsService';
import type { PostDoc } from '../../types';
import { formatDateLabel } from '../../utils/format';

/** 커뮤니티 탭 — Firestore posts 간단 게시판 */
export function CommunityBoardPanel() {
  const { sessionUid, isLoggedIn, isInitialized } = useAuth();
  const [text, setText] = useState('');
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setPosts([]);
      setLoading(false);
      return;
    }
    try {
      const list = await listPosts(30);
      setPosts(list);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!isInitialized || !isLoggedIn || !sessionUid) {
      setError('로그인이 필요합니다.');
      return;
    }
    setSaving(true);
    try {
      await createPost(text, sessionUid);
      setText('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <p className="muted" style={{ margin: '0 0 1rem', fontSize: '0.88rem', lineHeight: 1.55 }}>
        짧은 글을 남기는 게시판입니다. (Firebase 연결 시 저장됩니다.)
      </p>

      {!isFirebaseConfigured() && (
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          Firebase 설정이 없으면 글을 저장할 수 없습니다.
        </p>
      )}

      {isInitialized && isLoggedIn && isFirebaseConfigured() && (
        <form className="card" onSubmit={onSubmit} style={{ marginTop: '0.5rem' }}>
          <label className="muted" style={{ display: 'block', marginBottom: 8 }}>
            내용
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="여기에 글을 입력하세요."
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text)',
              resize: 'vertical',
              minHeight: 100,
            }}
          />
          {error ? (
            <p style={{ color: '#fca5a5', marginTop: '0.75rem', fontSize: '0.9rem' }}>{error}</p>
          ) : null}
          <button
            type="submit"
            className="btn btn--primary"
            style={{ marginTop: '1rem', minWidth: 120 }}
            disabled={saving || !text.trim()}
          >
            {saving ? '저장 중…' : '등록'}
          </button>
        </form>
      )}

      {isInitialized && !isLoggedIn && isFirebaseConfigured() && (
        <p className="muted" style={{ marginTop: '1rem' }}>
          글을 쓰려면 로그인하세요.
        </p>
      )}

      {!isInitialized && isFirebaseConfigured() && (
        <p className="muted" style={{ marginTop: '1rem' }}>
          세션 확인 중…
        </p>
      )}

      <section style={{ marginTop: '1.75rem' }}>
        <h2 className="section-title" style={{ fontSize: '1.05rem', marginBottom: '0.65rem' }}>
          글 목록
        </h2>
        {loading ? (
          <p className="muted">불러오는 중…</p>
        ) : posts.length === 0 ? (
          <p className="muted">아직 글이 없습니다.</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {posts.map((p) => (
              <li key={p.postId} className="card" style={{ marginBottom: '0.75rem' }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{p.content}</p>
                <p className="muted" style={{ margin: '0.65rem 0 0', fontSize: '0.82rem' }}>
                  uid: {p.uid.slice(0, 8)}… ·{' '}
                  {p.createdAt instanceof Timestamp
                    ? formatDateLabel(p.createdAt.toDate().toISOString())
                    : formatDateLabel(String(p.createdAt))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
