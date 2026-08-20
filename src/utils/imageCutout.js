/**
 * Utility to remove pure white background from product images in real-time
 * and return a clean, transparent PNG data URL with smooth anti-aliased alpha edges.
 */

const cutoutCache = new Map();

export function getTransparentProductImage(imageSrc) {
  return new Promise((resolve) => {
    if (cutoutCache.has(imageSrc)) {
      resolve(cutoutCache.get(imageSrc));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const len = data.length;

        // Strip white background with smooth alpha falloff
        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If near pure white
          if (r > 235 && g > 235 && b > 235) {
            const minChannel = Math.min(r, g, b);
            if (minChannel > 248) {
              data[i + 3] = 0; // Fully transparent
            } else {
              // Smooth edge transition
              const factor = (255 - minChannel) / (255 - 235);
              data[i + 3] = Math.round(data[i + 3] * factor);
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const transparentUrl = canvas.toDataURL('image/png');
        cutoutCache.set(imageSrc, transparentUrl);
        resolve(transparentUrl);
      } catch (err) {
        console.warn('Transparent cutout fallback:', err);
        resolve(imageSrc);
      }
    };

    img.onerror = () => {
      resolve(imageSrc);
    };

    img.src = imageSrc;
  });
}
