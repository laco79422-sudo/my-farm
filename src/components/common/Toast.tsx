import { useEffect } from 'react';
import { useToastStore } from '../../stores/useToastStore';
import './Toast.css';

const AUTO_HIDE_MS = 3200;

export function ToastHost() {
  const message = useToastStore((s) => s.message);
  const hide = useToastStore((s) => s.hide);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => hide(), AUTO_HIDE_MS);
    return () => window.clearTimeout(t);
  }, [message, hide]);

  if (!message) return null;

  return (
    <div className="app-toast" role="status">
      {message}
    </div>
  );
}
