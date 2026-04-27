import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { cn } from '@/lib/cn';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export function PasswordGenerator() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const [length, setLength] = useState('16');
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [pwd, setPwd] = useState('');

  function generate() {
    const sets: string[] = [];
    if (lower) sets.push('abcdefghijklmnopqrstuvwxyz');
    if (upper) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (digits) sets.push('0123456789');
    if (symbols) sets.push('!@#$%^&*()-_=+[]{};:,.<>?');
    if (sets.length === 0) return setPwd('');
    const charset = sets.join('');
    const len = Math.max(4, Math.min(64, parseInt(length) || 16));
    let p = '';
    for (let i = 0; i < len; i++) {
      p += charset[Math.floor(Math.random() * charset.length)];
    }
    setPwd(p);
  }

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Length" value={length} onChangeText={setLength} keyboardType="numeric" />
          {[
            { v: upper, set: setUpper, label: 'Uppercase (A–Z)' },
            { v: lower, set: setLower, label: 'Lowercase (a–z)' },
            { v: digits, set: setDigits, label: 'Digits (0–9)' },
            { v: symbols, set: setSymbols, label: 'Symbols (!@#…)' },
          ].map((it) => (
            <Pressable
              key={it.label}
              onPress={() => it.set(!it.v)}
              className="flex-row items-center py-3 px-3 rounded-md border-hairline border-border dark:border-border-dark"
            >
              <Text variant="body" className="flex-1">{it.label}</Text>
              <View
                className={cn(
                  'w-5.5 h-5.5 rounded items-center justify-center border-2',
                  it.v ? 'bg-primary border-primary dark:bg-primary-dark dark:border-primary-dark' : 'border-border-strong dark:border-border-strong-dark',
                )}
                style={{ width: 22, height: 22 }}
              >
                {it.v ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
              </View>
            </Pressable>
          ))}
          <Button title="Generate" icon="refresh" onPress={generate} fullWidth size="md" />
        </View>
      </Card>

      {pwd ? (
        <Card className="bg-primary-soft dark:bg-primary-softDark border-primary/30">
          <Text variant="caption" tone="primary">PASSWORD</Text>
          <Text className="text-xl font-bold mt-1 font-mono text-ink dark:text-ink-dark" selectable style={{ color: tokens.text, fontFamily: 'monospace' }}>
            {pwd}
          </Text>
        </Card>
      ) : null}
    </View>
  );
}

export function Base64Converter() {
  const [text, setText] = useState('Hello UniCalc Hub');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const out = useMemo(() => {
    try {
      if (mode === 'encode') {
        if (typeof btoa !== 'undefined') return btoa(unescape(encodeURIComponent(text)));
        return Buffer.from(text, 'utf-8').toString('base64');
      } else {
        if (typeof atob !== 'undefined') return decodeURIComponent(escape(atob(text)));
        return Buffer.from(text, 'base64').toString('utf-8');
      }
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
            label={mode === 'encode' ? 'Plain text' : 'Base64 text'}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            style={{ minHeight: 80, textAlignVertical: 'top' }}
            autoCapitalize="none"
          />
        </View>
      </Card>
      <ResultDisplay label={mode === 'encode' ? 'Base64' : 'Plain text'} value={out} emphasize={false} />
    </View>
  );
}

export function WordCounter() {
  const [text, setText] = useState('');
  const stats = useMemo(() => {
    const t = text;
    const words = t.trim() ? t.trim().split(/\s+/).length : 0;
    const chars = t.length;
    const charsNoSpace = t.replace(/\s/g, '').length;
    const sentences = (t.match(/[^.!?]+[.!?]+/g) || []).length;
    const paragraphs = t.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const minutes = Math.ceil(words / 220);
    return { words, chars, charsNoSpace, sentences, paragraphs, minutes };
  }, [text]);
  return (
    <View className="gap-3">
      <Card>
        <Input
          label="Text"
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={8}
          placeholder="Paste or type your text…"
          style={{ minHeight: 160, textAlignVertical: 'top' }}
          autoCapitalize="none"
        />
      </Card>
      <Card variant="subtle">
        <View className="flex-row flex-wrap gap-4">
          {[
            ['Words', stats.words],
            ['Characters', stats.chars],
            ['No spaces', stats.charsNoSpace],
            ['Sentences', stats.sentences],
            ['Paragraphs', stats.paragraphs],
            ['Read min', stats.minutes],
          ].map(([label, v]) => (
            <View key={String(label)} className="w-[30%]" style={{ minWidth: 90 }}>
              <Text variant="caption" tone="muted">{String(label).toUpperCase()}</Text>
              <Text variant="h3" className="mt-0.5">{String(v)}</Text>
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

export function CaseConverter() {
  const [text, setText] = useState('');
  const out = {
    upper: text.toUpperCase(),
    lower: text.toLowerCase(),
    title: text.replace(/\w\S*/g, (s) => s[0].toUpperCase() + s.slice(1).toLowerCase()),
    sentence: text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
  };
  return (
    <View className="gap-3">
      <Card>
        <Input
          label="Text"
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
          autoCapitalize="none"
        />
      </Card>
      {([
        ['UPPERCASE', out.upper],
        ['lowercase', out.lower],
        ['Title Case', out.title],
        ['Sentence case', out.sentence],
      ] as const).map(([label, v]) => (
        <Card key={label}>
          <Text variant="caption" tone="muted">{label}</Text>
          <Text variant="body" selectable className="mt-1">{v || '—'}</Text>
        </Card>
      ))}
    </View>
  );
}

export function TextReverser() {
  const [text, setText] = useState('');
  const reversed = text.split('').reverse().join('');
  const wordsReversed = text.split(/\s+/).reverse().join(' ');
  return (
    <View className="gap-3">
      <Card>
        <Input label="Text" value={text} onChangeText={setText} multiline style={{ minHeight: 80, textAlignVertical: 'top' }} autoCapitalize="none" />
      </Card>
      <Card>
        <Text variant="caption" tone="muted">REVERSED CHARS</Text>
        <Text variant="body" selectable className="mt-1">{reversed || '—'}</Text>
      </Card>
      <Card>
        <Text variant="caption" tone="muted">REVERSED WORDS</Text>
        <Text variant="body" selectable className="mt-1">{wordsReversed || '—'}</Text>
      </Card>
    </View>
  );
}
