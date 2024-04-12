export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  ballColor: string;
}

export function radianToVector(radian: number): { x: number, y: number } {
  return {
    x: Math.cos(radian),
    y: Math.sin(radian),
  };
}

export function darkenColor(color: string, percent: number) {
  const num = parseInt(color.replace("#", ""), 16);
  const amount = Math.round(2.55 * percent);
  const r = (num >> 16) + amount;
  const b = (num >> 8 & 0x00FF) + amount;
  const g = (num & 0x0000FF) + amount;
  return "#" + (0x1000000 + (r<255?r<1?0:r:255)*0x10000 + (b<255?b<1?0:b:255)*0x100 + (g<255?g<1?0:g:255)).toString(16).slice(1);
}

export function lerp(x: number, y: number, t: number) {
  return x + t * (y - x);
}
