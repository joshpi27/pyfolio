/**
 * Inline SVG icon library (zero emoji icons).
 */

const SVG_ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

export const icons = {
  brandBracket: (size = 18) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 5H5v14h4M15 5h4v14h-4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="2.5" fill="var(--accent-teal)"/>
    </svg>`,

  sun: (size = 18) => `
    <svg width="${size}" height="${size}" ${SVG_ATTRS}>
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>`,

  moon: (size = 18) => `
    <svg width="${size}" height="${size}" ${SVG_ATTRS}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>`,

  menu: (size = 18) => `
    <svg width="${size}" height="${size}" ${SVG_ATTRS}>
      <line x1="4" x2="20" y1="6" y2="6"/>
      <line x1="4" x2="20" y1="12" y2="12"/>
      <line x1="4" x2="20" y1="18" y2="18"/>
    </svg>`,

  close: (size = 18) => `
    <svg width="${size}" height="${size}" ${SVG_ATTRS}>
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>`,

  search: (size = 16) => `
    <svg width="${size}" height="${size}" ${SVG_ATTRS}>
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>`,

  play: (size = 14) => `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="6 4 20 12 6 20 6 4"/>
    </svg>`,

  reset: (size = 14) => `
    <svg width="${size}" height="${size}" ${SVG_ATTRS}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
    </svg>`,

  copy: (size = 14) => `
    <svg width="${size}" height="${size}" ${SVG_ATTRS}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </svg>`,

  check: (size = 15) => `
    <svg width="${size}" height="${size}" ${SVG_ATTRS}>
      <path d="M20 6 9 17l-5-5"/>
    </svg>`,

  alert: (size = 15) => `
    <svg width="${size}" height="${size}" ${SVG_ATTRS}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <path d="M12 9v4M12 17h.01"/>
    </svg>`,

  bug: (size = 15) => `
    <svg width="${size}" height="${size}" ${SVG_ATTRS}>
      <path d="m8 2 1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/>
      <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
    </svg>`,

  arrowRight: (size = 16) => `
    <svg width="${size}" height="${size}" ${SVG_ATTRS}>
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>`,

  arrowLeft: (size = 16) => `
    <svg width="${size}" height="${size}" ${SVG_ATTRS}>
      <path d="m12 19-7-7 7-7M19 12H5"/>
    </svg>`,

  terminal: (size = 15) => `
    <svg width="${size}" height="${size}" ${SVG_ATTRS}>
      <polyline points="4 17 10 11 4 5"/>
      <line x1="12" x2="20" y1="19" y2="19"/>
    </svg>`
};
