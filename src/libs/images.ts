import { defer } from "rxjs";
import sharp from 'sharp';
import { Background, isGradient } from "../interfaces/background";

export function createImage(source: string, target: string, size: number, ratio: number, background: Background) {

  return defer(async () => {

    const baseSize = Math.round(size * ratio);

    const baseBuffer = await sharp(source)
      .resize(baseSize, baseSize, { fit: 'contain', background: { r: 255, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    const gradient = isGradient(background)
      ? await sharp(Buffer.from(`
        <svg viewBox="0 0 ${size} ${size}">
          <defs>
            <linearGradient id="myGradient" gradientTransform="rotate(${background.angle})">
              <stop offset="4%" stop-color="#${background.color1}" />
              <stop offset="96%" stop-color="#${background.color2}" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="${size}" height="${size}" fill="url('#myGradient')" />
        </svg>
        `)).toBuffer()
      : null;

    return sharp(
      {
        create: {
          width: size,
          height: size,
          channels: 3,
          background: isGradient(background) ? { r: 0, g: 0, b: 255 } : background
        }
      })
      .composite([
        ...( gradient ? [{ input: gradient }]:[]),
        { input: baseBuffer, gravity: 'centre' }
      ])
      .removeAlpha()
      .toFile(target);
  });

}