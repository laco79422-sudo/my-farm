import { Button } from '../common/Button';

type Props = {
  onGoogle: () => void;
  googleLoading: boolean;
  disabled?: boolean;
};

export function SocialLoginButtons({ onGoogle, googleLoading, disabled }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      <Button
        fullWidth
        variant="primary"
        disabled={disabled || googleLoading}
        onClick={onGoogle}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        {googleLoading ? '연결 중…' : 'Google로 계속하기'}
      </Button>
    </div>
  );
}
