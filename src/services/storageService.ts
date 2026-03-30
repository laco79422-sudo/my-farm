/**
 * Firebase Storage — 이미지 업로드 예시
 * 경로 규칙: users/{uid}/diagnoses/{fileName} 등
 */
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getFirebaseStorage, isFirebaseConfigured } from '../firebase';

function storage() {
  const s = getFirebaseStorage();
  if (!s || !isFirebaseConfigured()) {
    throw new Error('Storage를 사용할 수 없습니다. Firebase 설정과 Storage 버킷을 확인하세요.');
  }
  return s;
}

/**
 * 파일을 지정 경로에 업로드하고 공개 URL 반환
 */
export async function uploadFileAndGetUrl(path: string, file: Blob): Promise<string> {
  const r = ref(storage(), path);
  await uploadBytes(r, file);
  return getDownloadURL(r);
}

/** 진단 이미지용 경로 생성 */
export function buildDiagnosisImagePath(uid: string, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `users/${uid}/diagnoses/${Date.now()}_${safe}`;
}
