/**
 * Lightweight, zero-dependency single-pass Python syntax highlighter.
 * Safe against HTML injection and never re-parses emitted <span> tags.
 */

const TOKEN_REGEX = new RegExp(
  [
    '(?<comment>#[^\\n]*)',
    '(?<string>(?:[fFrRuU]{0,2})(?:"""[\\s\\S]*?"""|\'\'\'[\\s\\S]*?\'\'\'|"(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\'))',
    '(?<decorator>@[A-Za-z_][A-Za-z0-9_.]*)',
    '(?<keyword>\\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|False|finally|for|from|global|if|import|in|is|lambda|None|nonlocal|not|or|pass|raise|return|True|try|while|with|yield)\\b)',
    '(?<builtin>\\b(?:abs|all|any|bool|dict|enumerate|float|int|isinstance|len|list|max|min|open|print|range|round|set|sorted|str|sum|tuple|type|zip)\\b)',
    '(?<number>\\b\\d+(?:\\.\\d+)?\\b)',
  ].join('|'),
  'g'
);

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function highlightPython(code) {
  const source = String(code || '');
  let out = '';
  let lastIndex = 0;

  for (const match of source.matchAll(TOKEN_REGEX)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      out += escapeHtml(source.slice(lastIndex, idx));
    }

    const groups = match.groups || {};
    let cls = '';
    if (groups.comment) cls = 'tok-comment';
    else if (groups.string) cls = 'tok-string';
    else if (groups.decorator) cls = 'tok-decorator';
    else if (groups.keyword) cls = 'tok-keyword';
    else if (groups.builtin) cls = 'tok-builtin';
    else if (groups.number) cls = 'tok-number';

    const raw = match[0];
    out += cls ? `<span class="${cls}">${escapeHtml(raw)}</span>` : escapeHtml(raw);
    lastIndex = idx + raw.length;
  }

  if (lastIndex < source.length) {
    out += escapeHtml(source.slice(lastIndex));
  }

  return out;
}
