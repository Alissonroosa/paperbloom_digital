/**
 * Utility to crop and rotate images using canvas
 * Used with react-easy-crop output
 * Includes EXIF orientation fix for mobile photos
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Creates a cropped (and optionally rotated) image File from a source URL
 */
export async function getCroppedImage(
  imageSrc: string,
  cropArea: CropArea,
  rotation: number = 0,
  fileName: string = 'cropped.jpg'
): Promise<File> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // If there's rotation, we need to draw the full rotated image first,
  // then crop from that. Otherwise just crop directly.
  if (rotation !== 0) {
    // Calculate bounding box of the rotated image
    const radians = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const rotatedWidth = image.width * cos + image.height * sin;
    const rotatedHeight = image.width * sin + image.height * cos;

    // Draw rotated full image onto a temp canvas
    const rotCanvas = document.createElement('canvas');
    const rotCtx = rotCanvas.getContext('2d');
    if (!rotCtx) throw new Error('Could not get canvas context');

    rotCanvas.width = rotatedWidth;
    rotCanvas.height = rotatedHeight;

    rotCtx.translate(rotatedWidth / 2, rotatedHeight / 2);
    rotCtx.rotate(radians);
    rotCtx.drawImage(image, -image.width / 2, -image.height / 2);

    // Now crop from the rotated canvas
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    ctx.drawImage(
      rotCanvas,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );
  } else {
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    ctx.drawImage(
      image,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, cropArea.width, cropArea.height
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        resolve(new File([blob], fileName, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92
    );
  });
}


/**
 * Fix EXIF orientation for mobile photos.
 * Mobile cameras store orientation in EXIF metadata, but canvas/blob URLs
 * don't always respect it. This re-draws the image with correct orientation.
 * 
 * Returns a new object URL with the corrected image.
 */
export async function fixImageOrientation(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        // Use createImageBitmap which respects EXIF orientation in modern browsers
        // Then draw to canvas to "bake in" the correct orientation
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback: just return the object URL
          resolve(URL.createObjectURL(file));
          return;
        }

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(URL.createObjectURL(file));
              return;
            }
            resolve(URL.createObjectURL(blob));
          },
          'image/jpeg',
          0.95
        );
      };
      img.onerror = () => resolve(URL.createObjectURL(file));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
