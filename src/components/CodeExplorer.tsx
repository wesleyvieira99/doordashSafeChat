import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Code2, Copy, ExternalLink, FileCode2, LoaderCircle, RefreshCw, Search } from 'lucide-react';

type Lang = 'pt' | 'en';
type Bilingual = Record<Lang, string>;
type GuideBlock = { id: string; start: number; end: number; symbol: string; title: Bilingual; role: Bilingual; input: Bilingual; output: Bilingual; failure: Bilingual };
type SourceFile = { path: string; title: Bilingual; summary: Bilingual; language: 'python' | 'typescript'; lineCount: number; source: string; sha256: string; blocks: GuideBlock[] };
type Catalog = { version: number; files: SourceFile[]; missing: string[] };
type Token = { text: string; type: string };
const github = 'https://github.com/wesleyvieira99/doordashSafeChat/blob/main/';
const keywords = new Set(('import from export default interface type const let var function return class extends new throw if else for while try catch finally async await as of in typeof void never string number boolean readonly true false null undefined def elif except raise pass with is not and or None True False lambda yield global nonlocal staticmethod classmethod').split(' '));

// A small lexical highlighter: source remains React text, never injected HTML.
function highlight(source: string, language: SourceFile['language']): Token[][] {
  const pattern = language === 'python'
    ? /("""[\s\S]*?"""|'''[\s\S]*?'''|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g
    : /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b)/g;
  const lines: Token[][] = [[]];
  const append = (text: string, type = '') => {
    text.split('\n').forEach((part, index) => {
      if (index) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, type });
    });
  };
  let cursor = 0;
  for (const match of source.matchAll(pattern)) {
    append(source.slice(cursor, match.index));
    const text = match[0];
    const type = /^(\/\/|\/\*|#)/.test(text) ? 'comment' : /^["'`]/.test(text) ? 'string' : /^\d/.test(text) ? 'number' : keywords.has(text) ? 'keyword' : '';
    append(text, type);
    cursor = (match.index ?? 0) + text.length;
  }
  append(source.slice(cursor));
  return lines;
}
function validCatalog(value: unknown): value is Catalog {
  if (!value || typeof value !== 'object') return false;
  const c = value as Catalog;
  return c.version === 1 && Array.isArray(c.files) && Array.isArray(c.missing) && c.files.every((f) =>
    typeof f.path === 'string' && typeof f.source === 'string' && typeof f.lineCount === 'number' &&
    Array.isArray(f.blocks) && f.title && f.summary && (f.language === 'python' || f.language === 'typescript'));
}

export function CodeExplorer({ lang }: { lang: Lang }) {
  const t = (pt: string, en: string) => lang === 'pt' ? pt : en;
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [selectedPath, setSelectedPath] = useState('src/lib/engine.ts');
  const [query, setQuery] = useState('');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [range, setRange] = useState<{ start: number; end: number } | null>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    fetch(`${import.meta.env.BASE_URL}code/catalog.json`, { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error('catalog_unavailable'); return response.json() as Promise<unknown>; })
      .then((value) => { if (!validCatalog(value)) throw new Error('catalog_invalid'); setCatalog(value); setStatus('ready'); })
      .catch((error: unknown) => { if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus('error'); });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  const files = catalog?.files ?? [];
  const search = query.trim().toLocaleLowerCase(lang);
  const visible = useMemo(() => files.filter((file) => !search || `${file.path} ${file.title[lang]} ${file.summary[lang]} ${file.source}`.toLocaleLowerCase(lang).includes(search)), [files, search, lang]);
  const selected = visible.find((f) => f.path === selectedPath) ?? visible[0];
  const tokens = useMemo(() => selected ? highlight(selected.source, selected.language) : [], [selected]);
  const totalLines = files.reduce((sum, file) => sum + file.lineCount, 0);
  const selectFile = (path: string) => { setSelectedPath(path); setRange(null); setCopyState('idle'); if (codeRef.current) codeRef.current.scrollTop = 0; };
  const copy = async () => {
    if (!selected) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard_unavailable');
      await navigator.clipboard.writeText(selected.source);
      setCopyState('copied');
    } catch { setCopyState('error'); }
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState('idle'), 3500);
  };
  const showBlock = (block: GuideBlock) => {
    setRange({ start: block.start, end: block.end });
    const viewport = codeRef.current;
    const line = viewport?.querySelector<HTMLElement>(`[data-line="${block.start}"]`);
    if (viewport && line) viewport.scrollTop += line.getBoundingClientRect().top - viewport.getBoundingClientRect().top - 16;
    viewport?.focus({ preventScroll: true });
  };

  return <div className="code-explorer">
    <div className="section-heading">
      <span className="eyebrow">05 / {t('IMPLEMENTAÇÃO', 'IMPLEMENTATION')}</span>
      <h1>{t('Abra o código. Siga a decisão.', 'Open the code. Follow the decision.')}</h1>
      <p>{t('Os arquivos abaixo são extraídos da implementação real a cada build. Cada bloco tem uma leitura guiada, com entradas, saídas e limites.', 'The files below are extracted from the real implementation on every build. Each block has a guided reading with inputs, outputs and limits.')}</p>
    </div>
    <p className="notice">{t('O navegador e o núcleo da API executam regras determinísticas; o MCP consulta dados sintéticos. Um adaptador Ollama separado pode emitir pareceres se ativado localmente. Ele não está conectado ao site público e não pode alterar políticas ou executar ações.', 'The browser and API core run deterministic rules; MCP reads synthetic data. A separate Ollama adapter can provide advice if enabled locally. It is not connected to the public site and cannot change policies or execute actions.')}</p>
    {status === 'loading' && <div className="panel code-state" role="status"><LoaderCircle size={24} aria-hidden="true"/><p>{t('Carregando os arquivos da implementação…', 'Loading implementation files…')}</p></div>}
    {status === 'error' && <div className="panel code-state" role="alert"><p>{t('Não foi possível carregar o catálogo de código. Confira a conexão e tente novamente.', 'The source catalog could not be loaded. Check your connection and retry.')}</p><button className="text-button" onClick={() => setAttempt((n) => n + 1)}><RefreshCw size={16} aria-hidden="true"/>{t('Tentar novamente', 'Retry')}</button></div>}
    {status === 'ready' && <>
      <div className="code-summary micro"><span>{files.length} {t('arquivos autorais', 'authored files')}</span><span>{totalLines.toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US')} {t('linhas com leitura guiada', 'lines with guided reading')}</span><span>{t('Gerado a partir do código publicado', 'Generated from published source')}</span></div>
      <label className="search-row code-search"><Search size={18} aria-hidden="true"/><span className="sr-only">{t('Buscar arquivos ou conteúdo do código', 'Search files or source content')}</span><input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setRange(null); }} placeholder={t('Buscar arquivo, função ou trecho…', 'Search file, function or snippet…')}/></label>
      {!visible.length ? <div className="panel code-state" role="status"><p>{t('Nenhum arquivo corresponde a essa busca.', 'No files match this search.')}</p><button className="text-button" onClick={() => setQuery('')}>{t('Limpar busca', 'Clear search')}</button></div> : selected && <>
        <div className="code-layout panel">
          <nav className="code-tree" aria-label={t('Arquivos da implementação', 'Implementation files')}>
            {visible.map((file) => <button key={file.path} type="button" className={selected.path === file.path ? 'active' : ''} aria-current={selected.path === file.path ? 'true' : undefined} onClick={() => selectFile(file.path)}>
              <FileCode2 size={17} aria-hidden="true"/><span><strong>{file.title[lang]}</strong><small>{file.path}</small></span>
            </button>)}
          </nav>
          <section className="code-view" aria-label={selected.title[lang]}>
            <div className="code-toolbar"><div><span className="chip">{selected.language === 'python' ? 'Python' : 'TypeScript'}</span><h2>{selected.title[lang]}</h2><p className="micro">{selected.path} · {selected.lineCount} {t('linhas', 'lines')}</p></div><div className="toolbar-actions">
              <button type="button" className="text-button" onClick={copy} aria-label={t('Copiar arquivo completo', 'Copy full file')}>{copyState === 'copied' ? <Check size={17} aria-hidden="true"/> : <Copy size={17} aria-hidden="true"/>}{copyState === 'copied' ? t('Copiado', 'Copied') : t('Copiar', 'Copy')}</button>
              <a href={`${github}${selected.path}`} target="_blank" rel="noreferrer" className="text-button">GitHub <ExternalLink size={15} aria-hidden="true"/></a>
            </div></div>
            <p className="code-description">{selected.summary[lang]}</p>
            <div className="micro code-copy-status" role="status" aria-live="polite">{copyState === 'error' ? t('O navegador não permitiu copiar. Selecione o texto do painel ou abra o arquivo no GitHub.', 'The browser did not allow copying. Select the panel text or open the file on GitHub.') : copyState === 'copied' ? t('Arquivo completo copiado para a área de transferência.', 'The full file was copied to the clipboard.') : ''}</div>
            {range && <div className="code-range micro">{t('Bloco destacado', 'Highlighted block')}: {range.start}–{range.end}<button className="text-button" onClick={() => setRange(null)}>{t('Remover destaque', 'Clear highlight')}</button></div>}
            <pre className="code-source" ref={codeRef} tabIndex={0} aria-label={t(`Código de ${selected.path}. Use as setas para rolar.`, `Source for ${selected.path}. Use arrow keys to scroll.`)}><code>{tokens.map((line, index) => <span key={`${selected.path}-${index}`} data-line={index + 1} className={`code-line${range && index + 1 >= range.start && index + 1 <= range.end ? ' highlighted' : ''}`}><span className="code-number" aria-hidden="true">{index + 1}</span><span className="code-text">{line.length ? line.map((token, n) => <span key={n} className={token.type ? `code-token code-token-${token.type}` : undefined}>{token.text}</span>) : ' '}</span>{'\n'}</span>)}</code></pre>
            <details className="code-integrity"><summary className="micro">{t('Integridade do arquivo · SHA-256', 'File integrity · SHA-256')}</summary><p className="micro">{t('Hash calculado sobre o arquivo original durante o build. Identifica esta versão; não é uma assinatura ou verificação externa.', 'Hash computed from the original file during the build. Identifies this version; it is not a signature or external verification.')}</p><code>{selected.sha256}</code></details>
          </section>
        </div>
        <section className="code-guides" aria-label={t('Leitura guiada do arquivo', 'Guided file reading')}>
          <div className="code-guide-heading"><Code2 size={22} aria-hidden="true"/><div><h2>{t('Entenda cada bloco', 'Understand each block')}</h2><p>{t('Todas as linhas do arquivo estão cobertas pelos intervalos abaixo, incluindo contratos, imports e configuração.', 'Every line in this file is covered by the ranges below, including contracts, imports and configuration.')}</p></div></div>
          {selected.blocks.map((block) => <details className="code-guide panel" key={block.id}>
            <summary><span className="chip">{block.start}–{block.end}</span><span><strong>{block.title[lang]}</strong><small>{block.symbol === 'imports' ? t('Preparação do módulo', 'Module setup') : block.symbol}</small></span></summary>
            <div className="code-guide-body"><p>{block.role[lang]}</p><dl><div><dt>{t('Entrada', 'Input')}</dt><dd>{block.input[lang]}</dd></div><div><dt>{t('Saída', 'Output')}</dt><dd>{block.output[lang]}</dd></div><div><dt>{t('Falhas e limites', 'Failures and limits')}</dt><dd>{block.failure[lang]}</dd></div></dl><div className="toolbar-actions"><button className="text-button" onClick={() => showBlock(block)}>{t('Destacar no código', 'Highlight in source')}</button><a className="text-button" href={`${github}${selected.path}#L${block.start}-L${block.end}`} target="_blank" rel="noreferrer">{t('Abrir essas linhas', 'Open these lines')} <ExternalLink size={14} aria-hidden="true"/></a></div></div>
          </details>)}
        </section>
      </>}
      {catalog && catalog.missing.length > 0 && <p className="notice">{t('Arquivos opcionais ausentes neste build:', 'Optional files absent from this build:')} {catalog.missing.join(', ')}</p>}
    </>}
  </div>;
}
