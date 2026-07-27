import { FilterProps } from '../types/timeline';

/**
 * Builds CSS filter string for preview or canvas rendering context
 */
export function buildCssFilterString(filters: FilterProps): string {
  const parts: string[] = [];

  if (filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`);
  if (filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`);
  if (filters.saturate !== 100) parts.push(`saturate(${filters.saturate}%)`);
  if (filters.hueRotate !== 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
  if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`);

  // Temperature approximation using hue and saturate shift
  if (filters.temperature !== 0) {
    if (filters.temperature > 0) {
      parts.push(`sepia(${filters.temperature * 0.3}%)`);
    } else {
      parts.push(`hue-rotate(${filters.temperature * 0.5}deg)`);
    }
  }

  return parts.length > 0 ? parts.join(' ') : 'none';
}

/**
 * Generates an SVG or CSS gradient data URL for custom thumbnail generation
 */
export function generateGradientThumbnail(color1: string, color2: string, text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
    </defs>
    <rect width="320" height="180" fill="url(#g)"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="20">${text}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
