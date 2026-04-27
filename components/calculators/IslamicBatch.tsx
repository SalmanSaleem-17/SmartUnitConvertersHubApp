import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Picker } from '@/components/ui/Picker';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { fetchSalahTimes, geocodeCity, type GeoMatch, type SalahTimings } from '@/lib/api';
import { calculateFaraiz, type FaraizInputs, type SpouseStatus, type Gender } from '@/lib/faraiz';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani', 'Jumada al-Awwal',
  'Jumada al-Thani', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu al-Qa'dah", 'Dhu al-Hijjah',
];

function gregorianToHijri(d: Date): { y: number; m: number; d: number } {
  const jd = Math.floor((d.getTime() / 86400000) + 2440587.5);
  const days = jd - 1948440 + 10632;
  const n = Math.floor((days - 1) / 10631);
  let dd = days - 10631 * n + 354;
  const j =
    Math.floor((10985 - dd) / 5316) * Math.floor((50 * dd) / 17719) +
    Math.floor(dd / 5670) * Math.floor((43 * dd) / 15238);
  dd =
    dd -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const m = Math.floor((24 * dd) / 709);
  const dh = dd - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;
  return { y, m, d: dh };
}

function hijriToGregorian(y: number, m: number, d: number): Date {
  const jd =
    Math.floor((11 * y + 3) / 30) +
    354 * y +
    30 * m -
    Math.floor((m - 1) / 2) +
    d +
    1948440 -
    386;
  return new Date((jd - 2440587.5) * 86400000);
}

// ───────── 1. Hijri ↔ Gregorian Converter ─────────
export function HijriGregorianConverter() {
  const [mode, setMode] = useState<'g2h' | 'h2g'>('g2h');
  const [greg, setGreg] = useState(() => new Date().toISOString().slice(0, 10));
  const [hy, setHy] = useState('1446');
  const [hm, setHm] = useState('10');
  const [hd, setHd] = useState('15');

  const out = useMemo(() => {
    if (mode === 'g2h') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(greg)) return null;
      const d = new Date(greg + 'T00:00:00');
      if (isNaN(d.getTime())) return null;
      const h = gregorianToHijri(d);
      return {
        primary: `${h.d} ${HIJRI_MONTHS[h.m - 1] ?? '—'} ${h.y} AH`,
        sub: d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      };
    } else {
      const y = parseInt(hy);
      const m = parseInt(hm);
      const d = parseInt(hd);
      if (![y, m, d].every(isFinite) || m < 1 || m > 12 || d < 1 || d > 30) return null;
      const greg = hijriToGregorian(y, m, d);
      return {
        primary: greg.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        sub: `${d} ${HIJRI_MONTHS[m - 1]} ${y} AH`,
      };
    }
  }, [mode, greg, hy, hm, hd]);

  return (
    <View className="gap-3">
      <Card>
        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={[
            { label: 'Gregorian → Hijri', value: 'g2h' },
            { label: 'Hijri → Gregorian', value: 'h2g' },
          ]}
        />
        <View className="gap-3 mt-3.5">
          {mode === 'g2h' ? (
            <Input label="Gregorian date (YYYY-MM-DD)" value={greg} onChangeText={setGreg} autoCapitalize="none" icon="calendar" />
          ) : (
            <>
              <View className="flex-row gap-2">
                <View className="flex-1"><Input label="Year (AH)" value={hy} onChangeText={setHy} keyboardType="numeric" /></View>
                <View className="flex-1"><Input label="Day (1–30)" value={hd} onChangeText={setHd} keyboardType="numeric" /></View>
              </View>
              <Picker
                label="Month"
                value={hm}
                onChange={setHm}
                options={HIJRI_MONTHS.map((name, i) => ({ label: `${i + 1}. ${name}`, value: String(i + 1) }))}
              />
            </>
          )}
        </View>
      </Card>
      <ResultDisplay label={mode === 'g2h' ? 'Hijri date' : 'Gregorian date'} value={out ? out.primary : '—'} sub={out?.sub} />
      <Card variant="subtle">
        <Text variant="caption" tone="muted">NOTE</Text>
        <Text variant="small" tone="muted" className="mt-1">
          Uses the Tabular Islamic algorithm. Sighting-based calendars in different regions may differ by ±1 day.
        </Text>
      </Card>
    </View>
  );
}

// ───────── 2. Sehri & Iftar 30-day schedule ─────────
export function SehriIftarScheduleCalculator() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const [city, setCity] = useState('Karachi');
  const [match, setMatch] = useState<GeoMatch | null>(null);
  const [days, setDays] = useState<{ date: string; readable: string; t: SalahTimings }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const ms = await geocodeCity(city);
      if (ms.length === 0) { setError('City not found.'); return; }
      const m = ms[0];
      setMatch(m);
      const today = new Date();
      const fetched = await Promise.all(
        Array.from({ length: 30 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          const date = `${dd}-${mm}-${yyyy}`;
          return fetchSalahTimes({ date, latitude: m.latitude, longitude: m.longitude, method: 2 })
            .then((data) => ({ date, readable: data.date.readable, t: data.timings }))
            .catch(() => null);
        })
      );
      setDays(fetched.filter((x): x is NonNullable<typeof x> => x !== null));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const fmt = (s: string) => s.split(' ')[0];

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="City" value={city} onChangeText={setCity} icon="location" autoCapitalize="words" />
          <Button title={loading ? 'Loading 30 days…' : 'Generate schedule'} icon="calendar" onPress={load} fullWidth />
          {error ? <Text variant="small" tone="danger">{error}</Text> : null}
        </View>
      </Card>
      {loading && days.length === 0 ? (
        <Card className="items-center py-6">
          <ActivityIndicator color={tokens.primary} />
          <Text variant="small" tone="muted" className="mt-2">Fetching 30 days of timings…</Text>
        </Card>
      ) : null}
      {match && days.length > 0 ? (
        <>
          <Card variant="subtle">
            <Text variant="bodyStrong">{match.name}{match.admin1 ? ', ' + match.admin1 : ''}, {match.country}</Text>
            <Text variant="small" tone="muted">{days.length} days · ISNA method</Text>
          </Card>
          {days.map((d) => (
            <Card key={d.date}>
              <Text variant="bodyStrong">{d.readable}</Text>
              <View className="flex-row gap-3 mt-2">
                <View className="flex-1">
                  <Text variant="caption" tone="muted">SEHRI / FAJR</Text>
                  <Text variant="h3" className="mt-0.5">{fmt(d.t.Fajr)}</Text>
                </View>
                <View className="flex-1">
                  <Text variant="caption" tone="muted">IFTAR / MAGHRIB</Text>
                  <Text variant="h3" className="mt-0.5" tone="primary">{fmt(d.t.Maghrib)}</Text>
                </View>
                <View className="flex-1">
                  <Text variant="caption" tone="muted">ISHA</Text>
                  <Text variant="h3" className="mt-0.5">{fmt(d.t.Isha)}</Text>
                </View>
              </View>
            </Card>
          ))}
        </>
      ) : null}
    </View>
  );
}

// ───────── 3. Faraiz inheritance — full Sunni rules ─────────
const SPOUSE_OPTIONS: { label: string; value: SpouseStatus }[] = [
  { label: 'Married (currently)',         value: 'married' },
  { label: 'In iddah (revocable divorce)', value: 'iddah-revocable' },
  { label: 'Widow in iddah',               value: 'iddah-widow' },
  { label: 'Divorced (final)',             value: 'divorced-final' },
  { label: 'No spouse / never married',    value: 'none' },
];

export function FaraizCalculator() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;
  const [showRules, setShowRules] = useState(false);
  const [showHeirs, setShowHeirs] = useState(true);

  const [estate, setEstate] = useState('1000000');
  const [deceasedGender, setDeceasedGender] = useState<Gender>('male');
  const [spouseStatus, setSpouseStatus] = useState<SpouseStatus>('married');
  const [wivesCount, setWivesCount] = useState('1');
  const [sons, setSons] = useState('2');
  const [daughters, setDaughters] = useState('1');
  const [fatherAlive, setFatherAlive] = useState(true);
  const [motherAlive, setMotherAlive] = useState(true);
  const [fullBrothers, setFullBrothers] = useState('0');
  const [fullSisters, setFullSisters] = useState('0');

  const result = useMemo(() => {
    const inputs: FaraizInputs = {
      estate: parseFloat(estate) || 0,
      deceasedGender,
      spouseStatus,
      wivesCount: Math.max(1, parseInt(wivesCount) || 1),
      sons: Math.max(0, parseInt(sons) || 0),
      daughters: Math.max(0, parseInt(daughters) || 0),
      fatherAlive,
      motherAlive,
      fullBrothers: Math.max(0, parseInt(fullBrothers) || 0),
      fullSisters: Math.max(0, parseInt(fullSisters) || 0),
    };
    return calculateFaraiz(inputs);
  }, [estate, deceasedGender, spouseStatus, wivesCount, sons, daughters, fatherAlive, motherAlive, fullBrothers, fullSisters]);

  const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <View className="gap-3">
      {/* Estate + deceased gender */}
      <Card>
        <Input label="Net estate (after debts, funeral, will up to 1/3)" value={estate} onChangeText={setEstate} keyboardType="decimal-pad" icon="cash" />
        <View className="mt-2.5">
          <Text variant="caption" tone="muted" className="mb-1.5">DECEASED</Text>
          <SegmentedControl
            value={deceasedGender}
            onChange={setDeceasedGender}
            options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]}
          />
        </View>
      </Card>

      {/* Spouse */}
      <Card>
        <Text variant="bodyStrong">Spouse</Text>
        <View className="gap-2.5 mt-2">
          <Picker
            label="Spouse status"
            value={spouseStatus}
            onChange={(v) => setSpouseStatus(v as SpouseStatus)}
            options={SPOUSE_OPTIONS}
          />
          {deceasedGender === 'male' && (spouseStatus === 'married' || spouseStatus === 'iddah-revocable') ? (
            <Input label="Number of wives (1–4)" value={wivesCount} onChangeText={setWivesCount} keyboardType="numeric" />
          ) : null}
        </View>
      </Card>

      {/* Children */}
      <Card>
        <Text variant="bodyStrong">Children</Text>
        <View className="flex-row gap-2 mt-2">
          <View className="flex-1"><Input label="Sons" value={sons} onChangeText={setSons} keyboardType="numeric" /></View>
          <View className="flex-1"><Input label="Daughters" value={daughters} onChangeText={setDaughters} keyboardType="numeric" /></View>
        </View>
      </Card>

      {/* Parents */}
      <Card>
        <Text variant="bodyStrong">Parents</Text>
        <View className="flex-row gap-2 mt-2">
          <View className="flex-1">
            <Pressable
              onPress={() => setFatherAlive(!fatherAlive)}
              className="flex-row items-center px-3 py-3 rounded-md border-hairline border-border dark:border-border-dark"
            >
              <Text variant="body" className="flex-1">Father alive</Text>
              <View className={`w-5 h-5 rounded items-center justify-center border-2 ${fatherAlive ? 'bg-primary border-primary dark:bg-primary-dark dark:border-primary-dark' : 'border-border-strong dark:border-border-strong-dark'}`}>
                {fatherAlive ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
              </View>
            </Pressable>
          </View>
          <View className="flex-1">
            <Pressable
              onPress={() => setMotherAlive(!motherAlive)}
              className="flex-row items-center px-3 py-3 rounded-md border-hairline border-border dark:border-border-dark"
            >
              <Text variant="body" className="flex-1">Mother alive</Text>
              <View className={`w-5 h-5 rounded items-center justify-center border-2 ${motherAlive ? 'bg-primary border-primary dark:bg-primary-dark dark:border-primary-dark' : 'border-border-strong dark:border-border-strong-dark'}`}>
                {motherAlive ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
              </View>
            </Pressable>
          </View>
        </View>
      </Card>

      {/* Siblings (Kalalah) */}
      <Card>
        <Text variant="bodyStrong">Siblings</Text>
        <Text variant="caption" tone="muted" className="mt-0.5">Inherit only when there are no children and no father (Kalalah).</Text>
        <View className="flex-row gap-2 mt-2">
          <View className="flex-1"><Input label="Brothers" value={fullBrothers} onChangeText={setFullBrothers} keyboardType="numeric" /></View>
          <View className="flex-1"><Input label="Sisters" value={fullSisters} onChangeText={setFullSisters} keyboardType="numeric" /></View>
        </View>
      </Card>

      <ResultDisplay
        label="Distributed"
        value={`${(result.totalDistributed * 100).toFixed(2)}%`}
        sub={result.heirs.length > 0 ? `${result.heirs.length} heir group${result.heirs.length === 1 ? '' : 's'}` : 'No eligible heirs'}
      />

      {/* Heirs list */}
      {result.heirs.length > 0 ? (
        <Card>
          <Pressable onPress={() => setShowHeirs(!showHeirs)} className="flex-row items-center active:opacity-80">
            <Text variant="bodyStrong" className="flex-1">Distribution</Text>
            <Ionicons name={showHeirs ? 'chevron-up' : 'chevron-down'} size={18} color={tokens.icon} />
          </Pressable>
          {showHeirs ? (
            <View className="gap-2 mt-3">
              {result.heirs.map((h) => (
                <View key={h.key} className="rounded-md border-hairline border-border dark:border-border-dark p-3">
                  <View className="flex-row items-center">
                    <View className="flex-1">
                      <Text variant="bodyStrong">{h.label}</Text>
                      <Text variant="caption" tone="muted">{h.shareLabel}</Text>
                    </View>
                    <View>
                      <Text variant="bodyStrong" tone="primary" align="right">{fmt(h.amount)}</Text>
                      <Text variant="caption" tone="muted" align="right">{(h.fraction * 100).toFixed(2)}%</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : null}
        </Card>
      ) : null}

      {/* Notes */}
      {result.notes.length > 0 ? (
        <Card variant="subtle">
          <Text variant="bodyStrong" tone="warning">Notes</Text>
          {result.notes.map((note, i) => (
            <Text key={i} variant="small" tone="muted" className="mt-1.5">{note}</Text>
          ))}
        </Card>
      ) : null}

      {/* Reasoning expandable */}
      <Card variant="subtle">
        <Pressable onPress={() => setShowRules(!showRules)} className="flex-row items-center active:opacity-80">
          <View className="flex-1">
            <Text variant="bodyStrong">Reasoning per heir</Text>
            <Text variant="caption" tone="muted">Quranic basis & juristic notes</Text>
          </View>
          <Ionicons name={showRules ? 'chevron-up' : 'chevron-down'} size={18} color={tokens.icon} />
        </Pressable>
        {showRules ? (
          <View className="gap-2 mt-3">
            {result.heirs.map((h) => (
              <View key={`r-${h.key}`} className="rounded-md border-hairline border-border dark:border-border-dark p-3">
                <Text variant="bodyStrong">{h.label}</Text>
                <Text variant="small" tone="muted" className="mt-1">{h.reason}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      <Card variant="subtle">
        <Text variant="caption" tone="muted">DISCLAIMER</Text>
        <Text variant="small" tone="muted" className="mt-1">
          Sunni rules only. Covers spouse, children, parents, and siblings (Kalalah). Does not handle orphaned grandchildren, distant grandparents, or full Awl/Radd mathematics. For real estate distribution, consult a qualified Mufti.
        </Text>
      </Card>
    </View>
  );
}
