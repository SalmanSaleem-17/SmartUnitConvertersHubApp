import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { cn } from '@/lib/cn';

const FNS: Record<string, (x: number) => number> = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sqrt: Math.sqrt, ln: Math.log, log: Math.log10,
  abs: Math.abs, exp: Math.exp,
};

function tokenize(s: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      tokens.push(s.slice(i, j));
      i = j;
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      let j = i;
      while (j < s.length && /[a-zA-Z]/.test(s[j])) j++;
      tokens.push(s.slice(i, j));
      i = j;
      continue;
    }
    tokens.push(ch);
    i++;
  }
  return tokens;
}

function evaluate(expr: string): number {
  const tokens = tokenize(expr);
  let pos = 0;
  function peek() { return tokens[pos]; }
  function eat(t?: string) { const x = tokens[pos++]; if (t && x !== t) throw new Error('Expected ' + t); return x; }
  function parseExpr(): number {
    let v = parseTerm();
    while (peek() === '+' || peek() === '-') { const op = eat(); const r = parseTerm(); v = op === '+' ? v + r : v - r; }
    return v;
  }
  function parseTerm(): number {
    let v = parsePower();
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = eat(); const r = parsePower();
      v = op === '*' ? v * r : op === '/' ? v / r : v % r;
    }
    return v;
  }
  function parsePower(): number {
    const v = parseUnary();
    if (peek() === '^') { eat(); return Math.pow(v, parsePower()); }
    return v;
  }
  function parseUnary(): number {
    if (peek() === '-') { eat(); return -parseUnary(); }
    if (peek() === '+') { eat(); return parseUnary(); }
    return parsePrimary();
  }
  function parsePrimary(): number {
    const t = peek();
    if (t === '(') { eat('('); const v = parseExpr(); eat(')'); return v; }
    if (/^[0-9.]/.test(t)) { eat(); return parseFloat(t); }
    if (/^[a-zA-Z]/.test(t)) {
      const name = eat();
      if (name === 'pi') return Math.PI;
      if (name === 'e') return Math.E;
      if (FNS[name]) { eat('('); const arg = parseExpr(); eat(')'); return FNS[name](arg); }
      throw new Error('Unknown ' + name);
    }
    throw new Error('Unexpected ' + t);
  }
  const v = parseExpr();
  if (pos !== tokens.length) throw new Error('Trailing input');
  return v;
}

type Tone = 'primary' | 'fn' | 'op' | 'eq' | 'clear';
const PAD: { label: string; value: string; tone?: Tone }[] = [
  { label: 'C', value: 'C', tone: 'clear' },
  { label: '⌫', value: 'BS', tone: 'clear' },
  { label: '(', value: '(', tone: 'fn' },
  { label: ')', value: ')', tone: 'fn' },
  { label: 'sin', value: 'sin(', tone: 'fn' },
  { label: 'cos', value: 'cos(', tone: 'fn' },
  { label: 'tan', value: 'tan(', tone: 'fn' },
  { label: '^', value: '^', tone: 'op' },
  { label: '√', value: 'sqrt(', tone: 'fn' },
  { label: 'ln', value: 'ln(', tone: 'fn' },
  { label: 'log', value: 'log(', tone: 'fn' },
  { label: '÷', value: '/', tone: 'op' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '×', value: '*', tone: 'op' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '−', value: '-', tone: 'op' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '+', value: '+', tone: 'op' },
  { label: 'π', value: 'pi' },
  { label: '0', value: '0' },
  { label: '.', value: '.' },
  { label: '=', value: '=', tone: 'eq' },
];

const toneClasses: Record<Tone, { wrap: string; fg: string }> = {
  primary: { wrap: 'bg-muted dark:bg-muted-dark', fg: 'text-ink dark:text-ink-dark' },
  fn:      { wrap: 'bg-muted dark:bg-muted-dark', fg: 'text-accent dark:text-accent-dark' },
  op:      { wrap: 'bg-primary-soft dark:bg-primary-softDark', fg: 'text-primary dark:text-primary-dark' },
  eq:      { wrap: 'bg-primary dark:bg-primary-dark', fg: 'text-white' },
  clear:   { wrap: 'bg-danger/15 dark:bg-danger-dark/15', fg: 'text-danger dark:text-danger-dark' },
};

export function ScientificCalculator() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const [expr, setExpr] = useState('');
  const result = useMemo(() => {
    if (!expr.trim()) return '';
    try {
      const v = evaluate(expr);
      if (!isFinite(v)) return 'Error';
      return v.toLocaleString(undefined, { maximumFractionDigits: 8 });
    } catch {
      return '';
    }
  }, [expr]);

  function press(v: string) {
    if (v === 'C') return setExpr('');
    if (v === 'BS') return setExpr((e) => e.slice(0, -1));
    if (v === '=') {
      try {
        const out = evaluate(expr);
        if (isFinite(out)) setExpr(String(out));
      } catch {}
      return;
    }
    setExpr((e) => e + v);
  }

  return (
    <View className="gap-3">
      <Card>
        <Text variant="caption" tone="muted">EXPRESSION</Text>
        <Text variant="h2" className="mt-1 min-h-[30px]">{expr || '0'}</Text>
        <Text variant="caption" tone="muted" className="mt-3">RESULT</Text>
        <Text className="text-3xl font-extrabold min-h-[32px]" style={{ color: tokens.primary }}>
          {result || '—'}
        </Text>
      </Card>

      <View className="flex-row flex-wrap gap-2">
        {PAD.map((b) => {
          const t = toneClasses[b.tone ?? 'primary'];
          return (
            <Pressable
              key={b.label}
              onPress={() => press(b.value)}
              className={cn('items-center justify-center rounded-md active:opacity-70', t.wrap)}
              style={{ width: '23.5%', height: 56 }}
            >
              <Text variant="h3" className={t.fg}>{b.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
