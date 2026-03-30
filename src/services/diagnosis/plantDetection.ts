/**
 * 식물 여부 간이 판별 — 캔버스 샘플링(녹색 계열 비율).
 * 실제 서비스에서는 전용 분류 API로 교체.
 */
export async function checkIsPlantFromImageFile(file: File): Promise<boolean> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    return false;
  }
  try {
    const w = 96;
    const h = 96;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    ctx.drawImage(bmp, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);
    let greenish = 0;
    const total = w * h;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!;
      const g = data[i + 1]!;
      const b = data[i + 2]!;
      if (g > r + 12 && g > b + 8 && g > 45) greenish++;
    }
    const ratio = greenish / total;
    return ratio > 0.055;
  } finally {
    bmp.close();
  }
}
