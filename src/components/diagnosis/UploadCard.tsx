import type { RefObject } from 'react';
import { prefersCameraCapture } from '../../utils/device';

type Props = {
  busy: boolean;
  previewUrl: string | null;
  cameraInputRef: RefObject<HTMLInputElement | null>;
  galleryInputRef: RefObject<HTMLInputElement | null>;
  onPick: (file: File | null) => void;
};

export function UploadCard({ busy, previewUrl, cameraInputRef, galleryInputRef, onPick }: Props) {
  const useCameraCapture = prefersCameraCapture();

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <div style={{ display: 'grid', gap: '0.65rem', gridTemplateColumns: '1fr' }}>
        <label
          htmlFor="mvp-diag-camera"
          style={{
            display: 'block',
            border: '2px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: 'center',
            cursor: busy ? 'wait' : 'pointer',
            background: 'var(--color-bg-elevated)',
            opacity: busy ? 0.7 : 1,
          }}
        >
          <input
            ref={cameraInputRef}
            id="mvp-diag-camera"
            type="file"
            accept="image/*"
            {...(useCameraCapture ? { capture: 'environment' as const } : {})}
            className="sr-only"
            disabled={busy}
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          <span style={{ fontSize: '1.75rem' }} aria-hidden>
            📷
          </span>
          <p style={{ margin: '0.45rem 0 0', fontWeight: 700 }}>사진 찍고 진단하기</p>
          <p className="muted" style={{ margin: '0.35rem 0 0', fontSize: '0.82rem' }}>
            {useCameraCapture ? '카메라로 바로 촬영합니다' : '이미지 파일을 선택합니다'}
          </p>
        </label>

        <label
          htmlFor="mvp-diag-gallery"
          style={{
            display: 'block',
            border: '2px solid rgba(124, 240, 210, 0.35)',
            borderRadius: 'var(--radius-md)',
            padding: '1.1rem',
            textAlign: 'center',
            cursor: busy ? 'wait' : 'pointer',
            background: 'var(--color-bg-elevated)',
            opacity: busy ? 0.85 : 1,
          }}
        >
          <input
            ref={galleryInputRef}
            id="mvp-diag-gallery"
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          <span style={{ fontSize: '1.5rem' }} aria-hidden>
            🖼
          </span>
          <p style={{ margin: '0.35rem 0 0', fontWeight: 600 }}>앨범에서 사진 선택</p>
        </label>
      </div>

      {previewUrl ? (
        <div style={{ marginTop: '1rem' }}>
          <p className="muted" style={{ margin: '0 0 0.35rem', fontSize: '0.78rem' }}>
            선택한 이미지
          </p>
          <img
            src={previewUrl}
            alt="진단에 사용할 식물 사진"
            style={{
              width: '100%',
              maxHeight: 280,
              objectFit: 'contain',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
