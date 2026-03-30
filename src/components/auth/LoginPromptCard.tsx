import { Card } from '../common/Card';

type Props = {
  title?: string;
  children: React.ReactNode;
};

export function LoginPromptCard({ title = '로그인이 필요합니다', children }: Props) {
  return (
    <Card style={{ padding: '1rem', marginTop: '1rem', borderStyle: 'dashed' }}>
      <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>{title}</p>
      <div className="muted" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
        {children}
      </div>
    </Card>
  );
}
