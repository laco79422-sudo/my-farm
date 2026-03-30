import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PostCard } from '../community/PostCard';
import { CommunityBoardPanel } from '../community/CommunityBoardPanel';
import { dummyCommunityPosts } from '../../data/dummyCommunity';
import type { CommunityCategory } from '../../types';

const CAT_META: { key: CommunityCategory; label: string; hint: string }[] = [
  { key: '게시글', label: '게시글', hint: '사진·일상' },
  { key: '재배 팁', label: '재배 후기', hint: '노하우' },
  { key: '질문답변', label: '질문', hint: 'Q&A' },
];

type LoungeMode = 'lounge' | 'board';

/** 농부들 > 커뮤니티 탭 — 기존 커뮤니티 페이지 기능을 이 안으로 통합 */
export function FarmersCommunityPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cat, setCat] = useState<CommunityCategory>('게시글');

  const mode: LoungeMode = searchParams.get('view') === 'board' ? 'board' : 'lounge';

  const posts = useMemo(
    () => dummyCommunityPosts.filter((p) => p.category === cat),
    [cat],
  );

  function setMode(next: LoungeMode) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'community');
    if (next === 'board') {
      nextParams.set('view', 'board');
    } else {
      nextParams.delete('view');
    }
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <div className="farmers-community-panel">
      <p className="muted" style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', lineHeight: 1.55 }}>
        사진·재배 후기·질문을 한데 모았습니다. 상품 카드에서 농부 프로필로 들어가면 그 농부의 글도 함께 확인할
        수 있어요.
      </p>

      <div className="tab-bar" role="tablist" aria-label="커뮤니티 구역">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'lounge'}
          className={'tab-bar__btn' + (mode === 'lounge' ? ' tab-bar__btn--active' : '')}
          onClick={() => setMode('lounge')}
        >
          라운지
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'board'}
          className={'tab-bar__btn' + (mode === 'board' ? ' tab-bar__btn--active' : '')}
          onClick={() => setMode('board')}
        >
          게시판
        </button>
      </div>

      {mode === 'board' ? (
        <div style={{ marginTop: '1.25rem' }}>
          <CommunityBoardPanel />
        </div>
      ) : (
        <>
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn--primary"
              style={{ minHeight: 48 }}
              onClick={() => window.alert('MVP: 새 글 작성 모달/페이지 연동 예정 (+30P)')}
            >
              새 게시글
            </button>
          </div>

          <div
            className="tab-bar"
            role="tablist"
            aria-label="콘텐츠 유형"
            style={{ marginTop: '0.85rem' }}
          >
            {CAT_META.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={cat === key}
                className={'tab-bar__btn' + (cat === key ? ' tab-bar__btn--active' : '')}
                onClick={() => setCat(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="muted" style={{ marginTop: '0.75rem', marginBottom: 0, fontSize: '0.85rem' }}>
            <strong style={{ color: 'var(--color-mint)' }}>
              {CAT_META.find((c) => c.key === cat)?.label}
            </strong>
            <span className="muted"> · {CAT_META.find((c) => c.key === cat)?.hint}</span> — 글{' '}
            {posts.length}개
          </p>

          <div className="grid-cards cols-3" style={{ marginTop: '1.1rem' }}>
            {posts.map((p) => (
              <PostCard key={p.postId} post={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
