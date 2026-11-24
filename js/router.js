/**
 * Hash-based router for static hosts (Vercel, Netlify, GitHub Pages)
 * that preserves in-memory session state and loaded Pyodide runtime across pages.
 */

export function parseRoute(hash = window.location.hash) {
  const raw = (hash || '#/').replace(/^#/, '') || '/';
  const [pathPart, queryPart] = raw.split('?');
  const cleanPath = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  const params = new URLSearchParams(queryPart || '');

  if (cleanPath === '/' || cleanPath === '') {
    return { name: 'home', path: '/', params };
  }
  if (cleanPath.startsWith('/lessons/')) {
    const slug = cleanPath.slice('/lessons/'.length).replace(/\/+$/, '');
    return { name: 'lesson', slug, path: cleanPath, params };
  }
  if (cleanPath === '/playground') {
    return { name: 'playground', path: '/playground', params };
  }
  if (cleanPath === '/cheatsheet') {
    return { name: 'cheatsheet', path: '/cheatsheet', params };
  }
  if (cleanPath === '/glossary') {
    return { name: 'glossary', path: '/glossary', params };
  }

  return { name: 'home', path: '/', params };
}

export function navigate(targetHash) {
  const normalized = targetHash.startsWith('#') ? targetHash : `#${targetHash}`;
  if (window.location.hash === normalized) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    window.location.hash = normalized;
  }
}
