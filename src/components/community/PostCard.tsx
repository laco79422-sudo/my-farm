import type { CommunityPostDoc } from '../../types';
import { formatDateLabel } from '../../utils/format';

interface Props {
  post: CommunityPostDoc;
}

export function PostCard({ post }: Props) {
  return (
    <article className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          style={{ width: '100%', height: 160, objectFit: 'cover' }}
        />
      )}
      <div style={{ padding: '1rem 1.15rem' }}>
        <span className="chip" style={{ marginBottom: 8 }}>
          {post.category}
        </span>
        <h3 style={{ margin: '0.35rem 0', fontSize: '1.05rem' }}>{post.title}</h3>
        <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
          {post.content.slice(0, 120)}
          {post.content.length > 120 ? '…' : ''}
        </p>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>{post.authorName}</span>
          <span>{formatDateLabel(String(post.createdAt))}</span>
        </div>
        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
          💬 {post.commentCount} · ❤️ {post.likeCount}
        </div>
      </div>
    </article>
  );
}
