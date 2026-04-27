import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ResultDisplay } from '@/components/ui/ResultDisplay';

const ZODIAC: { name: string; from: [number, number]; to: [number, number]; symbol: string }[] = [
  { name: 'Capricorn', from: [12, 22], to: [1, 19], symbol: '♑' },
  { name: 'Aquarius',  from: [1, 20],  to: [2, 18], symbol: '♒' },
  { name: 'Pisces',    from: [2, 19],  to: [3, 20], symbol: '♓' },
  { name: 'Aries',     from: [3, 21],  to: [4, 19], symbol: '♈' },
  { name: 'Taurus',    from: [4, 20],  to: [5, 20], symbol: '♉' },
  { name: 'Gemini',    from: [5, 21],  to: [6, 20], symbol: '♊' },
  { name: 'Cancer',    from: [6, 21],  to: [7, 22], symbol: '♋' },
  { name: 'Leo',       from: [7, 23],  to: [8, 22], symbol: '♌' },
  { name: 'Virgo',     from: [8, 23],  to: [9, 22], symbol: '♍' },
  { name: 'Libra',     from: [9, 23],  to: [10, 22], symbol: '♎' },
  { name: 'Scorpio',   from: [10, 23], to: [11, 21], symbol: '♏' },
  { name: 'Sagittarius', from: [11, 22], to: [12, 21], symbol: '♐' },
];

function zodiacFor(d: Date) {
  const m = d.getMonth() + 1; const day = d.getDate();
  for (const z of ZODIAC) {
    if (z.name === 'Capricorn') {
      if ((m === 12 && day >= 22) || (m === 1 && day <= 19)) return z;
      continue;
    }
    if (m === z.from[0] && day >= z.from[1]) return z;
    if (m === z.to[0] && day <= z.to[1]) return z;
  }
  return ZODIAC[0];
}

export function ZodiacCalculator() {
  const [date, setDate] = useState('2000-04-15');
  const d = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(date + 'T00:00:00') : null;
  const z = d && !isNaN(d.getTime()) ? zodiacFor(d) : null;
  return (
    <View className="gap-3">
      <Card>
        <Input label="Date of birth (YYYY-MM-DD)" value={date} onChangeText={setDate} icon="calendar" autoCapitalize="none" />
      </Card>
      <ResultDisplay label="Zodiac sign" value={z ? `${z.symbol}  ${z.name}` : '—'} />
    </View>
  );
}

const CHINESE = ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'];

export function ChineseZodiacCalculator() {
  const [year, setYear] = useState('2000');
  const y = parseInt(year);
  const sign = isFinite(y) ? CHINESE[((y % 12) + 12) % 12] : null;
  return (
    <View className="gap-3">
      <Card>
        <Input label="Birth year" value={year} onChangeText={setYear} keyboardType="numeric" />
      </Card>
      <ResultDisplay label="Chinese zodiac" value={sign ?? '—'} />
    </View>
  );
}

export function MagicEightBall() {
  const [answer, setAnswer] = useState<string | null>(null);
  const answers = [
    'It is certain.', 'Without a doubt.', 'Yes, definitely.',
    'You may rely on it.', 'Most likely.', 'Outlook good.',
    'Yes.', 'Signs point to yes.',
    'Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.',
    "Don't count on it.", 'My reply is no.', 'My sources say no.',
    'Outlook not so good.', 'Very doubtful.',
  ];
  function shake() {
    setAnswer(answers[Math.floor(Math.random() * answers.length)]);
  }
  return (
    <View className="gap-3 items-center">
      <Pressable
        onPress={shake}
        className="w-56 h-56 rounded-full items-center justify-center bg-ink dark:bg-ink-dark active:opacity-85"
      >
        <View className="w-28 h-28 rounded-full items-center justify-center bg-bg dark:bg-bg-dark">
          <Text variant="body" align="center" className="px-4 text-ink dark:text-ink-dark">
            {answer ?? 'Ask a question and tap me'}
          </Text>
        </View>
      </Pressable>
      <Button title="Shake again" icon="refresh" onPress={shake} variant="secondary" />
    </View>
  );
}

export function CoinDiceRoller() {
  const [coin, setCoin] = useState<'Heads' | 'Tails' | '—'>('—');
  const [die, setDie] = useState<number>(0);
  return (
    <View className="gap-3">
      <Card>
        <Text variant="bodyStrong">Coin flip</Text>
        <View className="my-3"><ResultDisplay label="Result" value={coin} /></View>
        <Button title="Flip coin" icon="refresh" onPress={() => setCoin(Math.random() < 0.5 ? 'Heads' : 'Tails')} fullWidth size="md" />
      </Card>
      <Card>
        <Text variant="bodyStrong">Roll a die</Text>
        <View className="my-3"><ResultDisplay label="You rolled" value={die === 0 ? '—' : String(die)} /></View>
        <Button title="Roll d6" icon="refresh" onPress={() => setDie(1 + Math.floor(Math.random() * 6))} fullWidth size="md" />
      </Card>
    </View>
  );
}

export function NumerologyCalculator() {
  const [name, setName] = useState('Smart Unit');
  const [dob, setDob] = useState('2000-01-01');

  function reduce(n: number): number {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce((s, c) => s + parseInt(c), 0);
    }
    return n;
  }
  const lifePath = (() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return null;
    const sum = dob.replace(/-/g, '').split('').reduce((s, c) => s + parseInt(c), 0);
    return reduce(sum);
  })();
  const expression = (() => {
    const sum = name.toUpperCase().split('').reduce((s, c) => s + (c.match(/[A-Z]/) ? ((c.charCodeAt(0) - 64 - 1) % 9 + 1) : 0), 0);
    return sum > 0 ? reduce(sum) : null;
  })();

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Full name" value={name} onChangeText={setName} icon="person" />
          <Input label="Date of birth" value={dob} onChangeText={setDob} icon="calendar" autoCapitalize="none" />
        </View>
      </Card>
      <ResultDisplay label="Life Path Number" value={lifePath?.toString() ?? '—'} />
      <ResultDisplay label="Expression Number" emphasize={false} value={expression?.toString() ?? '—'} />
    </View>
  );
}
