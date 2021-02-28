export interface Gradient {
  color1: string;
  color2: string;
  angle: number;
}

export interface SolidBackground {
  r: number;
  g: number;
  b: number;
}

export type Background = Gradient | SolidBackground;

export function isGradient(background: any): background is Gradient {
  return typeof background === 'object' && 'color1' in background && 'color2' in background && 'angle' in background;
}