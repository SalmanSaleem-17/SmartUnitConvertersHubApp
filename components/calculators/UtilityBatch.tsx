import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

// ---------- 1) Hash Calculator ----------
function djb2(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash * 33) ^ input.charCodeAt(i)) >>> 0;
  }
  return hash >>> 0;
}

function crc32Like(input: string): string {
  let c = 0xffffffff;
  for (let i = 0; i < input.length; i++) {
    c ^= input.charCodeAt(i);
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
  }
  return ((c ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

function simpleChecksum(input: string): number {
  let sum = 0;
  for (let i = 0; i < input.length; i++) sum = (sum + input.charCodeAt(i)) % 65536;
  return sum;
}

export function HashCalculator() {
  const [text, setText] = useState('Hello UniCalc Hub');
  const out = useMemo(() => {
    const d = djb2(text);
    return {
      djb2Dec: d.toString(),
      djb2Hex: '0x' + d.toString(16),
      crc: crc32Like(text),
      checksum: simpleChecksum(text).toString(),
    };
  }, [text]);
  return (
    <View className="gap-3">
      <Card>
        <Input
          label="Input text"
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={4}
          autoCapitalize="none"
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />
      </Card>
      <Card>
        <Text variant="caption" tone="muted">DJB2 (DEC / HEX)</Text>
        <Text variant="body" selectable className="mt-1" style={{ fontFamily: 'monospace' }}>{out.djb2Dec}</Text>
        <Text variant="body" selectable className="mt-0.5" style={{ fontFamily: 'monospace' }}>{out.djb2Hex}</Text>
      </Card>
      <Card>
        <Text variant="caption" tone="muted">CRC32 (HEX)</Text>
        <Text variant="body" selectable className="mt-1" style={{ fontFamily: 'monospace' }}>{out.crc}</Text>
      </Card>
      <Card>
        <Text variant="caption" tone="muted">SIMPLE CHECKSUM (mod 65536)</Text>
        <Text variant="body" selectable className="mt-1" style={{ fontFamily: 'monospace' }}>{out.checksum}</Text>
      </Card>
      <Text variant="small" tone="subtle">Note: educational hashes only. Not cryptographically secure.</Text>
    </View>
  );
}

// ---------- 2) UUID v4 Generator ----------
function uuidv4(): string {
  const hex = '0123456789abcdef';
  let u = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) u += '-';
    else if (i === 14) u += '4';
    else if (i === 19) u += hex[(Math.random() * 4) | 0 | 8];
    else u += hex[(Math.random() * 16) | 0];
  }
  return u;
}

export function UuidGenerator() {
  const [single, setSingle] = useState(uuidv4());
  const [batch, setBatch] = useState<string[]>([]);
  return (
    <View className="gap-3">
      <Card>
        <Text variant="caption" tone="muted">UUID V4</Text>
        <Text variant="body" selectable className="mt-1" style={{ fontFamily: 'monospace' }}>{single}</Text>
        <View className="flex-row gap-2 mt-3">
          <View className="flex-1"><Button title="Generate" icon="refresh" onPress={() => setSingle(uuidv4())} fullWidth /></View>
          <View className="flex-1"><Button title="Generate 5" variant="secondary" onPress={() => setBatch(Array.from({ length: 5 }, uuidv4))} fullWidth /></View>
        </View>
      </Card>
      {batch.map((u, i) => (
        <Card key={i}>
          <Text variant="caption" tone="muted">#{i + 1}</Text>
          <Text variant="body" selectable className="mt-1" style={{ fontFamily: 'monospace' }}>{u}</Text>
        </Card>
      ))}
    </View>
  );
}

// ---------- 3) Unix Timestamp Converter ----------
export function UnixTimestampConverter() {
  const [mode, setMode] = useState<'toDate' | 'toUnix'>('toDate');
  const [ts, setTs] = useState(String(Math.floor(Date.now() / 1000)));
  const [iso, setIso] = useState(new Date().toISOString().slice(0, 19));

  const toDate = useMemo(() => {
    const n = parseInt(ts, 10);
    if (!isFinite(n)) return null;
    const d = new Date(n * 1000);
    if (isNaN(d.getTime())) return null;
    return { iso: d.toISOString(), local: d.toString() };
  }, [ts]);

  const toUnix = useMemo(() => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return { sec: Math.floor(d.getTime() / 1000), ms: d.getTime() };
  }, [iso]);

  return (
    <View className="gap-3">
      <Card>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { label: 'Unix → Date', value: 'toDate' },
            { label: 'Date → Unix', value: 'toUnix' },
          ]}
        />
        <View className="mt-3">
          {mode === 'toDate' ? (
            <Input label="Unix timestamp (seconds)" value={ts} onChangeText={setTs} keyboardType="numeric" autoCapitalize="none" />
          ) : (
            <Input label="ISO datetime" value={iso} onChangeText={setIso} placeholder="2025-01-01T12:00:00" autoCapitalize="none" />
          )}
        </View>
      </Card>
      {mode === 'toDate' ? (
        <>
          <ResultDisplay label="ISO 8601" value={toDate ? toDate.iso : '—'} emphasize={false} />
          <ResultDisplay label="Local readable" value={toDate ? toDate.local : '—'} emphasize={false} />
        </>
      ) : (
        <>
          <ResultDisplay label="Unix seconds" value={toUnix ? String(toUnix.sec) : '—'} />
          <ResultDisplay label="Unix milliseconds" value={toUnix ? String(toUnix.ms) : '—'} emphasize={false} />
        </>
      )}
    </View>
  );
}

// ---------- 4) Lorem Ipsum Generator ----------
const LOREM_POOL = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  'Nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse.',
  'Cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident.',
  'Sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Curabitur pretium tincidunt lacus.',
  'Nulla gravida orci a odio.',
  'Nullam varius, turpis et commodo pharetra, est eros bibendum elit.',
  'Nec luctus magna felis sollicitudin mauris.',
  'Integer in mauris eu nibh euismod gravida.',
  'Duis ac tellus et risus vulputate vehicula.',
  'Donec lobortis risus a elit.',
  'Etiam tempor, tortor ac dignissim convallis, lectus mi sodales lectus.',
  'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.',
  'Posuere cubilia curae.',
  'Praesent dapibus neque id cursus faucibus.',
  'Tortor neque egestas augue, eu vulputate magna eros eu erat.',
  'Aliquam erat volutpat.',
  'Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.',
  'Phasellus ultrices nulla quis nibh.',
  'Quisque a lectus.',
  'Donec consectetuer ligula vulputate sem tristique cursus.',
  'Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi.',
  'Pellentesque fermentum dolor.',
  'Aliquam quam lectus, facilisis auctor, ultrices ut, elementum vulputate, nunc.',
  'Sed adipiscing ornare risus.',
  'Morbi est est, blandit sit amet, sagittis vel, euismod vel, velit.',
  'Pellentesque egestas sem.',
  'Suspendisse commodo ullamcorper magna.',
];

function genLorem(count: number, html: boolean): string {
  const out: string[] = [];
  for (let p = 0; p < count; p++) {
    const sentenceCount = 4 + Math.floor(Math.random() * 4);
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(LOREM_POOL[Math.floor(Math.random() * LOREM_POOL.length)]);
    }
    const text = sentences.join(' ');
    out.push(html ? `<p>${text}</p>` : text);
  }
  return out.join(html ? '\n' : '\n\n');
}

export function LoremIpsumGenerator() {
  const [paragraphs, setParagraphs] = useState('3');
  const [withHtml, setWithHtml] = useState(false);
  const [text, setText] = useState(genLorem(3, false));
  function regenerate() {
    const n = Math.max(1, Math.min(20, parseInt(paragraphs) || 1));
    setText(genLorem(n, withHtml));
  }
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Paragraphs (1-20)" value={paragraphs} onChangeText={setParagraphs} keyboardType="numeric" />
          <SegmentedControl
            value={withHtml ? 'html' : 'plain'}
            onChange={(v) => setWithHtml(v === 'html')}
            options={[
              { label: 'Plain text', value: 'plain' },
              { label: 'With <p> tags', value: 'html' },
            ]}
          />
          <Button title="Generate" icon="refresh" onPress={regenerate} fullWidth />
        </View>
      </Card>
      <Card>
        <Text variant="caption" tone="muted">OUTPUT</Text>
        <Text variant="body" selectable className="mt-1">{text}</Text>
      </Card>
    </View>
  );
}

// ---------- 5) JSON ↔ CSV ----------
function jsonToCsv(jsonText: string): string {
  const data = JSON.parse(jsonText);
  if (!Array.isArray(data)) throw new Error('JSON must be an array of objects');
  if (data.length === 0) return '';
  const keys = Array.from(new Set(data.flatMap((o: any) => (o && typeof o === 'object' ? Object.keys(o) : []))));
  const escape = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const rows = [keys.join(',')];
  for (const obj of data) {
    rows.push(keys.map((k) => escape(obj?.[k])).join(','));
  }
  return rows.join('\n');
}

function csvToJson(csv: string): string {
  const lines = csv.replace(/\r\n/g, '\n').split('\n').filter((l) => l.length > 0);
  if (lines.length < 1) return '[]';
  const parseRow = (row: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < row.length; i++) {
      const c = row[i];
      if (inQ) {
        if (c === '"' && row[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else {
        if (c === ',') { out.push(cur); cur = ''; }
        else if (c === '"') inQ = true;
        else cur += c;
      }
    }
    out.push(cur);
    return out;
  };
  const header = parseRow(lines[0]);
  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseRow(lines[i]);
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => { obj[h] = fields[idx] ?? ''; });
    rows.push(obj);
  }
  return JSON.stringify(rows, null, 2);
}

export function JsonCsvConverter() {
  const [mode, setMode] = useState<'jsonToCsv' | 'csvToJson'>('jsonToCsv');
  const [text, setText] = useState('[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]');
  const result = useMemo(() => {
    try {
      return { ok: true as const, value: mode === 'jsonToCsv' ? jsonToCsv(text) : csvToJson(text) };
    } catch (e: any) {
      return { ok: false as const, value: e?.message || 'Parse error' };
    }
  }, [text, mode]);
  return (
    <View className="gap-3">
      <Card>
        <SegmentedControl
          value={mode}
          onChange={(v) => {
            setMode(v);
            setText(v === 'jsonToCsv' ? '[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]' : 'name,age\nAlice,30\nBob,25');
          }}
          options={[
            { label: 'JSON → CSV', value: 'jsonToCsv' },
            { label: 'CSV → JSON', value: 'csvToJson' },
          ]}
        />
        <View className="mt-3">
          <Input
            label={mode === 'jsonToCsv' ? 'JSON array' : 'CSV with header'}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={6}
            autoCapitalize="none"
            style={{ minHeight: 140, textAlignVertical: 'top' }}
          />
        </View>
      </Card>
      <Card>
        <Text variant="caption" tone={result.ok ? 'muted' : 'danger'}>
          {result.ok ? 'OUTPUT' : 'ERROR'}
        </Text>
        <Text variant="body" selectable className="mt-1" style={{ fontFamily: 'monospace' }}>{result.value}</Text>
      </Card>
    </View>
  );
}

// ---------- 6) JSON ↔ YAML ----------
function jsonToYaml(value: any, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (value === null) return 'null';
  if (typeof value === 'string') {
    if (/[:#\-\n"']/.test(value) || value.trim() !== value) return JSON.stringify(value);
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value.map((v) => {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        const inner = jsonToYaml(v, indent + 1);
        const lines = inner.split('\n');
        const first = lines.shift() || '';
        return `${pad}- ${first.trim()}` + (lines.length ? '\n' + lines.join('\n') : '');
      }
      return `${pad}- ${jsonToYaml(v, indent + 1)}`;
    }).join('\n');
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    return keys.map((k) => {
      const v = value[k];
      if (v && typeof v === 'object') {
        return `${pad}${k}:\n${jsonToYaml(v, indent + 1)}`;
      }
      return `${pad}${k}: ${jsonToYaml(v, indent + 1)}`;
    }).join('\n');
  }
  return String(value);
}

function parseYamlValue(raw: string): any {
  const t = raw.trim();
  if (t === '' || t === 'null' || t === '~') return null;
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(t)) return parseFloat(t);
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function yamlToJsonSafe(yaml: string): string {
  const rawLines = yaml.replace(/\r\n/g, '\n').split('\n');
  const lines: { indent: number; content: string }[] = [];
  for (const l of rawLines) {
    if (!l.trim() || l.trim().startsWith('#')) continue;
    const indent = l.length - l.replace(/^\s+/, '').length;
    lines.push({ indent, content: l.slice(indent) });
  }

  let i = 0;
  function parseBlock(currentIndent: number): any {
    if (i >= lines.length) return null;
    const first = lines[i];
    if (first.content.startsWith('- ') || first.content === '-') {
      const arr: any[] = [];
      while (i < lines.length && lines[i].indent === currentIndent && (lines[i].content.startsWith('- ') || lines[i].content === '-')) {
        const itemContent = lines[i].content === '-' ? '' : lines[i].content.slice(2);
        i++;
        if (itemContent.trim() === '') {
          if (i < lines.length && lines[i].indent > currentIndent) {
            arr.push(parseBlock(lines[i].indent));
          } else arr.push(null);
        } else {
          const m = itemContent.match(/^([^:]+):\s*(.*)$/);
          if (m && m[2].trim() === '' && i < lines.length && lines[i].indent > currentIndent) {
            const obj: any = {};
            obj[m[1].trim()] = parseBlock(lines[i].indent);
            // continue collecting more keys at same indent (currentIndent + 2 typical)
            const childIndent = currentIndent + 2;
            while (i < lines.length && lines[i].indent === childIndent && !lines[i].content.startsWith('- ')) {
              const m2 = lines[i].content.match(/^([^:]+):\s*(.*)$/);
              if (!m2) break;
              i++;
              if (m2[2].trim() === '' && i < lines.length && lines[i].indent > childIndent) {
                obj[m2[1].trim()] = parseBlock(lines[i].indent);
              } else {
                obj[m2[1].trim()] = parseYamlValue(m2[2]);
              }
            }
            arr.push(obj);
          } else if (m) {
            const obj: any = {};
            obj[m[1].trim()] = parseYamlValue(m[2]);
            const childIndent = currentIndent + 2;
            while (i < lines.length && lines[i].indent === childIndent && !lines[i].content.startsWith('- ')) {
              const m2 = lines[i].content.match(/^([^:]+):\s*(.*)$/);
              if (!m2) break;
              i++;
              if (m2[2].trim() === '' && i < lines.length && lines[i].indent > childIndent) {
                obj[m2[1].trim()] = parseBlock(lines[i].indent);
              } else {
                obj[m2[1].trim()] = parseYamlValue(m2[2]);
              }
            }
            arr.push(obj);
          } else {
            arr.push(parseYamlValue(itemContent));
          }
        }
      }
      return arr;
    } else {
      const obj: any = {};
      while (i < lines.length && lines[i].indent === currentIndent && !lines[i].content.startsWith('- ')) {
        const m = lines[i].content.match(/^([^:]+):\s*(.*)$/);
        if (!m) throw new Error('Invalid line: ' + lines[i].content);
        const key = m[1].trim();
        const val = m[2];
        i++;
        if (val.trim() === '') {
          if (i < lines.length && lines[i].indent > currentIndent) {
            obj[key] = parseBlock(lines[i].indent);
          } else obj[key] = null;
        } else {
          obj[key] = parseYamlValue(val);
        }
      }
      return obj;
    }
  }

  if (lines.length === 0) return '{}';
  const result = parseBlock(lines[0].indent);
  return JSON.stringify(result, null, 2);
}

export function JsonYamlConverter() {
  const [mode, setMode] = useState<'jsonToYaml' | 'yamlToJson'>('jsonToYaml');
  const [text, setText] = useState('{\n  "name": "Alice",\n  "age": 30,\n  "tags": ["admin", "user"]\n}');
  const result = useMemo(() => {
    try {
      if (mode === 'jsonToYaml') {
        const v = JSON.parse(text);
        return { ok: true as const, value: jsonToYaml(v) };
      }
      return { ok: true as const, value: yamlToJsonSafe(text) };
    } catch (e: any) {
      return { ok: false as const, value: e?.message || 'Parse error' };
    }
  }, [text, mode]);
  return (
    <View className="gap-3">
      <Card>
        <SegmentedControl
          value={mode}
          onChange={(v) => {
            setMode(v);
            setText(v === 'jsonToYaml'
              ? '{\n  "name": "Alice",\n  "age": 30,\n  "tags": ["admin", "user"]\n}'
              : 'name: Alice\nage: 30\ntags:\n  - admin\n  - user\n');
          }}
          options={[
            { label: 'JSON → YAML', value: 'jsonToYaml' },
            { label: 'YAML → JSON', value: 'yamlToJson' },
          ]}
        />
        <View className="mt-3">
          <Input
            label="Input"
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={6}
            autoCapitalize="none"
            style={{ minHeight: 140, textAlignVertical: 'top' }}
          />
        </View>
      </Card>
      <Card>
        <Text variant="caption" tone={result.ok ? 'muted' : 'danger'}>{result.ok ? 'OUTPUT' : 'ERROR'}</Text>
        <Text variant="body" selectable className="mt-1" style={{ fontFamily: 'monospace' }}>{result.value}</Text>
      </Card>
    </View>
  );
}

// ---------- 7) Markdown → HTML ----------
function markdownToHtml(md: string): string {
  const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inList = false;
  let inQuote = false;
  for (const raw of lines) {
    let line = raw;
    if (/^\s*$/.test(line)) {
      if (inList) { out.push('</ul>'); inList = false; }
      if (inQuote) { out.push('</blockquote>'); inQuote = false; }
      continue;
    }
    if (/^### /.test(line)) {
      if (inList) { out.push('</ul>'); inList = false; }
      if (inQuote) { out.push('</blockquote>'); inQuote = false; }
      out.push(`<h3>${inline(line.slice(4))}</h3>`); continue;
    }
    if (/^## /.test(line)) {
      if (inList) { out.push('</ul>'); inList = false; }
      if (inQuote) { out.push('</blockquote>'); inQuote = false; }
      out.push(`<h2>${inline(line.slice(3))}</h2>`); continue;
    }
    if (/^# /.test(line)) {
      if (inList) { out.push('</ul>'); inList = false; }
      if (inQuote) { out.push('</blockquote>'); inQuote = false; }
      out.push(`<h1>${inline(line.slice(2))}</h1>`); continue;
    }
    if (/^- /.test(line)) {
      if (inQuote) { out.push('</blockquote>'); inQuote = false; }
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${inline(line.slice(2))}</li>`); continue;
    }
    if (/^> /.test(line)) {
      if (inList) { out.push('</ul>'); inList = false; }
      if (!inQuote) { out.push('<blockquote>'); inQuote = true; }
      out.push(`<p>${inline(line.slice(2))}</p>`); continue;
    }
    if (inList) { out.push('</ul>'); inList = false; }
    if (inQuote) { out.push('</blockquote>'); inQuote = false; }
    out.push(`<p>${inline(line)}</p>`);
  }
  if (inList) out.push('</ul>');
  if (inQuote) out.push('</blockquote>');
  function inline(s: string) {
    let t = escapeHtml(s);
    t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    return t;
  }
  return out.join('\n');
}

export function MarkdownConverter() {
  const [md, setMd] = useState('# Hello\n\nThis is **bold** and *italic* with `code`.\n\n- Item 1\n- Item 2\n\n> A quote\n\n[Link](https://example.com)');
  const html = useMemo(() => markdownToHtml(md), [md]);
  return (
    <View className="gap-3">
      <Card>
        <Input
          label="Markdown source"
          value={md}
          onChangeText={setMd}
          multiline
          numberOfLines={8}
          autoCapitalize="none"
          style={{ minHeight: 180, textAlignVertical: 'top' }}
        />
      </Card>
      <Card>
        <Text variant="caption" tone="muted">RENDERED HTML</Text>
        <Text variant="body" selectable className="mt-1" style={{ fontFamily: 'monospace' }}>{html}</Text>
      </Card>
    </View>
  );
}

// ---------- 8) Color Converter ----------
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbStringParse(s: string): { r: number; g: number; b: number } | null {
  const m = s.trim().match(/^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  if (!m) return null;
  const r = parseInt(m[1]); const g = parseInt(m[2]); const b = parseInt(m[3]);
  if ([r, g, b].some((n) => n < 0 || n > 255)) return null;
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b); const min = Math.min(r, g, b);
  let h = 0; let s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

export function ColorConverter() {
  const [mode, setMode] = useState<'hex' | 'rgb'>('hex');
  const [hex, setHex] = useState('#0EA5A5');
  const [rgbInput, setRgbInput] = useState('rgb(14, 165, 165)');
  const parsed = useMemo(() => {
    if (mode === 'hex') return hexToRgb(hex);
    return rgbStringParse(rgbInput);
  }, [mode, hex, rgbInput]);
  const swatch = parsed ? rgbToHex(parsed.r, parsed.g, parsed.b) : '#cccccc';
  const hsl = parsed ? rgbToHsl(parsed.r, parsed.g, parsed.b) : null;
  return (
    <View className="gap-3">
      <Card>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { label: 'HEX', value: 'hex' },
            { label: 'RGB', value: 'rgb' },
          ]}
        />
        <View className="mt-3">
          {mode === 'hex' ? (
            <Input label="Hex color" value={hex} onChangeText={setHex} placeholder="#rrggbb or #rgb" autoCapitalize="none" />
          ) : (
            <Input label="rgb(r, g, b)" value={rgbInput} onChangeText={setRgbInput} placeholder="rgb(14, 165, 165)" autoCapitalize="none" />
          )}
        </View>
      </Card>
      <Card>
        <View className="flex-row items-center gap-3">
          <View style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: swatch, borderWidth: 1, borderColor: '#ccc' }} />
          <View className="flex-1">
            {parsed ? (
              <>
                <Text variant="caption" tone="muted">HEX</Text>
                <Text variant="bodyStrong" selectable style={{ fontFamily: 'monospace' }}>{rgbToHex(parsed.r, parsed.g, parsed.b)}</Text>
                <Text variant="caption" tone="muted" className="mt-1">RGB</Text>
                <Text variant="body" selectable style={{ fontFamily: 'monospace' }}>rgb({parsed.r}, {parsed.g}, {parsed.b})</Text>
                <Text variant="caption" tone="muted" className="mt-1">HSL</Text>
                <Text variant="body" selectable style={{ fontFamily: 'monospace' }}>hsl({hsl!.h}, {hsl!.s}%, {hsl!.l}%)</Text>
              </>
            ) : (
              <Text variant="body" tone="danger">Invalid color input</Text>
            )}
          </View>
        </View>
      </Card>
    </View>
  );
}

// ---------- 9) URL Encoder/Decoder ----------
export function UrlEncoderConverter() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [text, setText] = useState('Hello World & friends?');
  const out = useMemo(() => {
    try {
      return mode === 'encode' ? encodeURIComponent(text) : decodeURIComponent(text);
    } catch {
      return 'Invalid input';
    }
  }, [text, mode]);
  return (
    <View className="gap-3">
      <Card>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { label: 'Encode', value: 'encode' },
            { label: 'Decode', value: 'decode' },
          ]}
        />
        <View className="mt-3">
          <Input
            label={mode === 'encode' ? 'Plain text' : 'Encoded text'}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            autoCapitalize="none"
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
        </View>
      </Card>
      <Card>
        <Text variant="caption" tone="muted">{mode === 'encode' ? 'ENCODED' : 'DECODED'}</Text>
        <Text variant="body" selectable className="mt-1" style={{ fontFamily: 'monospace' }}>{out}</Text>
      </Card>
    </View>
  );
}

// ---------- 10) Regex Tester ----------
export function RegexTester() {
  const [pattern, setPattern] = useState('\\b\\w+\\b');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('Hello regex world, test 123!');
  const result = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags);
      const matches: string[] = [];
      if (re.global) {
        let m: RegExpExecArray | null;
        let safety = 0;
        while ((m = re.exec(testText)) !== null) {
          matches.push(m[0]);
          if (m.index === re.lastIndex) re.lastIndex++;
          if (++safety > 1000 || matches.length >= 50) break;
        }
      } else {
        const m = re.exec(testText);
        if (m) matches.push(m[0]);
      }
      return { ok: true as const, matches, count: matches.length };
    } catch (e: any) {
      return { ok: false as const, error: e?.message || 'Invalid regex' };
    }
  }, [pattern, flags, testText]);
  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Pattern" value={pattern} onChangeText={setPattern} autoCapitalize="none" />
          <Input label="Flags" value={flags} onChangeText={setFlags} placeholder="g, i, m..." autoCapitalize="none" />
          <Input
            label="Test text"
            value={testText}
            onChangeText={setTestText}
            multiline
            numberOfLines={4}
            autoCapitalize="none"
            style={{ minHeight: 100, textAlignVertical: 'top' }}
          />
        </View>
      </Card>
      {result.ok ? (
        <>
          <ResultDisplay label="Match count" value={String(result.count)} />
          <Card>
            <Text variant="caption" tone="muted">MATCHES (max 50)</Text>
            {result.matches.length === 0 ? (
              <Text variant="body" tone="subtle" className="mt-1">No matches.</Text>
            ) : (
              result.matches.map((m, i) => (
                <Text key={i} variant="body" selectable className="mt-1" style={{ fontFamily: 'monospace' }}>{i + 1}. {m}</Text>
              ))
            )}
          </Card>
        </>
      ) : (
        <Card>
          <Text variant="caption" tone="danger">INVALID REGEX</Text>
          <Text variant="body" tone="danger" className="mt-1">{result.error}</Text>
        </Card>
      )}
    </View>
  );
}

// ---------- 11) IBAN Validator ----------
function validateIban(input: string): { valid: boolean; country?: string; bank?: string; reason?: string } {
  const iban = input.replace(/\s+/g, '').toUpperCase();
  if (iban.length < 15 || iban.length > 34) return { valid: false, reason: 'Length must be 15–34 characters' };
  if (!/^[A-Z0-9]+$/.test(iban)) return { valid: false, reason: 'Contains invalid characters' };
  const country = iban.slice(0, 2);
  if (!/^[A-Z]{2}$/.test(country)) return { valid: false, reason: 'Invalid country code' };
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let numeric = '';
  for (const ch of rearranged) {
    if (/[A-Z]/.test(ch)) numeric += String(ch.charCodeAt(0) - 55);
    else numeric += ch;
  }
  // mod 97 over long string
  let remainder = 0;
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder * 10 + (numeric.charCodeAt(i) - 48)) % 97;
  }
  const bank = iban.slice(4, 8);
  return remainder === 1
    ? { valid: true, country, bank }
    : { valid: false, country, bank, reason: 'Checksum mismatch (mod 97 ≠ 1)' };
}

export function IbanValidator() {
  const [iban, setIban] = useState('GB82 WEST 1234 5698 7654 32');
  const result = useMemo(() => validateIban(iban), [iban]);
  return (
    <View className="gap-3">
      <Card>
        <Input
          label="IBAN"
          value={iban}
          onChangeText={setIban}
          placeholder="e.g. GB82 WEST 1234 5698 7654 32"
          autoCapitalize="characters"
        />
      </Card>
      <ResultDisplay
        label="Validity"
        value={result.valid ? 'Valid' : 'Invalid'}
        sub={result.valid ? `Country ${result.country} · Bank ${result.bank}` : result.reason}
        emphasize={result.valid}
      />
      {result.valid ? (
        <Card>
          <Text variant="caption" tone="muted">DETAILS</Text>
          <Text variant="body" className="mt-1">Country code: <Text variant="bodyStrong">{result.country}</Text></Text>
          <Text variant="body" className="mt-0.5">Bank identifier: <Text variant="bodyStrong">{result.bank}</Text></Text>
          <Text variant="body" className="mt-0.5">Normalized: <Text variant="bodyStrong" style={{ fontFamily: 'monospace' }}>{iban.replace(/\s+/g, '').toUpperCase()}</Text></Text>
        </Card>
      ) : null}
    </View>
  );
}
