// Spec 29 — compresión de fotos en el navegador antes de subirlas al álbum.
// La foto queda a 2048 px en su lado mayor (JPEG 0.82) y se genera una miniatura de 480 px.
// Una foto de celular de 3–5 MB queda en ~400 KB, muy por debajo del límite de 1.5 MB del servidor.

const PHOTO_MAX_SIDE = 2048;
const THUMB_MAX_SIDE = 480;
const PHOTO_QUALITY = 0.82;
const THUMB_QUALITY = 0.78;
const PHOTO_MAX_BYTES = 1.5 * 1024 * 1024;

export interface CompressedImage {
  photo: Blob;
  thumb: Blob;
  width: number;
  height: number;
}

export class UnsupportedImageError extends Error {}

async function decode(file: File): Promise<ImageBitmap> {
  try {
    // `imageOrientation: 'from-image'` respeta la rotación EXIF de las fotos de celular.
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    try {
      return await createImageBitmap(file);
    } catch {
      // HEIC fuera de Safari, archivos dañados, etc.
      throw new UnsupportedImageError('unsupported_image');
    }
  }
}

function render(bitmap: ImageBitmap, maxSide: number): HTMLCanvasElement {
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new UnsupportedImageError('no_canvas');
  // Fondo blanco: un PNG con transparencia no debe quedar negro al pasar a JPEG.
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas;
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new UnsupportedImageError('encode_failed'))), 'image/jpeg', quality);
  });
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const bitmap = await decode(file);
  try {
    const big = render(bitmap, PHOTO_MAX_SIDE);
    let photo = await toJpeg(big, PHOTO_QUALITY);
    // Caso raro (foto con mucho detalle): se baja la calidad hasta entrar en el límite del servidor.
    for (let q = PHOTO_QUALITY - 0.12; photo.size > PHOTO_MAX_BYTES && q >= 0.5; q -= 0.12) {
      photo = await toJpeg(big, q);
    }
    const thumb = await toJpeg(render(bitmap, THUMB_MAX_SIDE), THUMB_QUALITY);
    return { photo, thumb, width: big.width, height: big.height };
  } finally {
    bitmap.close();
  }
}
