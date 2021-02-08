import { defer } from "rxjs";
import sharp from 'sharp';

export function createImage(source: string, target: string, size: number, ratio: number, background: { r: number, g: number, b: number }) {

  return defer(async () => {

    const baseSize = Math.round(size * ratio);

    const baseBuffer = await sharp(source)
      .resize(baseSize, baseSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    return sharp(
      {
        create: {
          width: size,
          height: size,
          channels: 3,
          background
        }
      })
      .composite([
        { input: baseBuffer, gravity: 'centre' }
      ])
      .removeAlpha()
      .toFile(target);
  });

}