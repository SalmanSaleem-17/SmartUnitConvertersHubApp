import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Picker } from '@/components/ui/Picker';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { fetchGoldSilver } from '@/lib/api';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// ───────────────────── constants ─────────────────────
// Nisab thresholds (classical fiqh)
const NISAB_GOLD_GRAMS = 87.48;     // 7.5 tola of pure 24K gold
const NISAB_SILVER_GRAMS = 612.36;  // 52.5 tola of pure silver
// Subcontinental compound unit: 1 tola = 12 masha = 96 ratti
const TOLA_TO_GRAM = 11.6638;
const MASHA_TO_GRAM = TOLA_TO_GRAM / 12;
const RATTI_TO_GRAM = TOLA_TO_GRAM / 96;
const OZ_TO_GRAM = 31.1035;

const WEIGHT_UNITS = [
  { label: 'Gram (g)', value: 'gram' },
  { label: 'Tola',     value: 'tola' },
  { label: 'Tola+Masha+Ratti', value: 'tmr' },
  { label: 'Troy Ounce (oz)',  value: 'ounce' },
];
const PRICE_UNITS = [
  { label: 'per Gram',  value: 'gram' },
  { label: 'per Tola',  value: 'tola' },
  { label: 'per Ounce', value: 'ounce' },
];
const PRICE_TO_GRAM: Record<string, number> = { gram: 1, tola: TOLA_TO_GRAM, ounce: OZ_TO_GRAM };

const KARATS = [
  { label: '24K — 99.9%', value: '24', purity: 24 / 24 },
  { label: '22K — 91.7%', value: '22', purity: 22 / 24 },
  { label: '21K — 87.5%', value: '21', purity: 21 / 24 },
  { label: '18K — 75.0%', value: '18', purity: 18 / 24 },
  { label: '14K — 58.3%', value: '14', purity: 14 / 24 },
];
const SILVER_PURITIES = [
  { label: '.999 Fine (99.9%)',   value: '99.9' },
  { label: '.925 Sterling (92.5%)', value: '92.5' },
  { label: '.900 Coin (90%)',     value: '90' },
  { label: '.800 European (80%)', value: '80' },
];

type GoldItem = { id: number; desc: string; weight: string; tola: string; masha: string; ratti: string; unit: string; karat: string };
type SilverItem = { id: number; desc: string; weight: string; tola: string; masha: string; ratti: string; unit: string; purity: string };

function itemToGrams(it: { weight: string; tola: string; masha: string; ratti: string; unit: string }): number {
  if (it.unit === 'tmr') {
    const t = parseFloat(it.tola) || 0;
    const m = parseFloat(it.masha) || 0;
    const r = parseFloat(it.ratti) || 0;
    return t * TOLA_TO_GRAM + m * MASHA_TO_GRAM + r * RATTI_TO_GRAM;
  }
  const w = parseFloat(it.weight) || 0;
  if (it.unit === 'gram') return w;
  if (it.unit === 'tola') return w * TOLA_TO_GRAM;
  if (it.unit === 'ounce') return w * OZ_TO_GRAM;
  return w;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 0 });

// ───────────────────── component ─────────────────────
export function ZakatCalculator() {
  const scheme = useColorScheme();
  const tokens = scheme === 'dark' ? Colors.dark : Colors.light;

  // Metal prices (entered in user-chosen unit; converted to per-gram internally)
  const [goldPrice, setGoldPrice]         = useState('300000');
  const [goldPriceUnit, setGoldPriceUnit] = useState('tola');
  const [silverPrice, setSilverPrice]     = useState('3500');
  const [silverPriceUnit, setSilverPriceUnit] = useState('tola');
  const [fxUsdLocal, setFxUsdLocal]       = useState('278');
  const [livePriceLoading, setLivePriceLoading] = useState(false);
  const [livePriceErr, setLivePriceErr]   = useState<string | null>(null);

  // Multi-item gold
  const [gold, setGold] = useState<GoldItem[]>([
    { id: 1, desc: 'Wedding jewellery', weight: '', tola: '', masha: '', ratti: '', unit: 'tola', karat: '22' },
  ]);
  // Multi-item silver
  const [silver, setSilver] = useState<SilverItem[]>([
    { id: 1, desc: 'Silverware', weight: '', tola: '', masha: '', ratti: '', unit: 'tola', purity: '92.5' },
  ]);

  // Cash + assets
  const [cash, setCash] = useState('');
  const [bank, setBank] = useState('');
  const [invest, setInvest] = useState('');
  const [crypto, setCrypto] = useState('');
  const [biz, setBiz] = useState('');
  const [rental, setRental] = useState('');
  const [receivables, setReceivables] = useState('');
  // Liabilities
  const [debts, setDebts] = useState('');
  const [billsDue, setBillsDue] = useState('');

  // Show / hide sections
  const [showGold, setShowGold] = useState(true);
  const [showSilver, setShowSilver] = useState(true);
  const [showCash, setShowCash] = useState(true);
  const [showLiab, setShowLiab] = useState(true);

  // Live spot fetch (PKR estimate). User can override the FX field.
  async function fetchLive() {
    setLivePriceLoading(true); setLivePriceErr(null);
    try {
      const d = await fetchGoldSilver();
      const fx = parseFloat(fxUsdLocal) || 1;
      // gold-api gives USD per troy ounce; convert to per-tola in local
      const goldPerTolaLocal = d.gold.price * fx * (TOLA_TO_GRAM / OZ_TO_GRAM);
      const silverPerTolaLocal = d.silver.price * fx * (TOLA_TO_GRAM / OZ_TO_GRAM);
      setGoldPrice(goldPerTolaLocal.toFixed(0));
      setGoldPriceUnit('tola');
      setSilverPrice(silverPerTolaLocal.toFixed(0));
      setSilverPriceUnit('tola');
    } catch (e) {
      setLivePriceErr((e as Error).message);
    } finally {
      setLivePriceLoading(false);
    }
  }
  useEffect(() => {
    // first load: just attempt once silently
    fetchLive().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const n = (v: string) => parseFloat(v) || 0;

  const goldPricePerGram = n(goldPrice) / (PRICE_TO_GRAM[goldPriceUnit] ?? 1);
  const silverPricePerGram = n(silverPrice) / (PRICE_TO_GRAM[silverPriceUnit] ?? 1);

  const result = useMemo(() => {
    // Per-item gold valuation
    const goldRows = gold.map((g) => {
      const grams = itemToGrams(g);
      const purity = (KARATS.find((k) => k.value === g.karat)?.purity) ?? 1;
      const pureGrams = grams * purity;
      const value = pureGrams * goldPricePerGram;
      return { id: g.id, desc: g.desc, grams, pureGrams, value, karat: g.karat };
    });
    const totalGoldValue = goldRows.reduce((s, r) => s + r.value, 0);
    const totalGoldPure = goldRows.reduce((s, r) => s + r.pureGrams, 0);

    // Per-item silver valuation
    const silverRows = silver.map((s) => {
      const grams = itemToGrams(s);
      const purity = parseFloat(s.purity) / 100;
      const pureGrams = grams * purity;
      const value = pureGrams * silverPricePerGram;
      return { id: s.id, desc: s.desc, grams, pureGrams, value, purity: s.purity };
    });
    const totalSilverValue = silverRows.reduce((s, r) => s + r.value, 0);
    const totalSilverPure = silverRows.reduce((s, r) => s + r.pureGrams, 0);

    const cashAssets = n(cash) + n(bank);
    const investAssets = n(invest) + n(crypto);
    const bizAssets = n(biz) + n(rental);
    const otherAssets = n(receivables);
    const totalAssets = cashAssets + totalGoldValue + totalSilverValue + investAssets + bizAssets + otherAssets;

    const totalLiab = n(debts) + n(billsDue);
    const netWealth = totalAssets - totalLiab;

    // Use the LOWER of gold/silver Nisab (most generous to the poor)
    const nisabGold = NISAB_GOLD_GRAMS * goldPricePerGram;
    const nisabSilver = NISAB_SILVER_GRAMS * silverPricePerGram;
    const nisab = Math.min(nisabGold || Infinity, nisabSilver || Infinity);

    const eligible = netWealth >= nisab && nisab > 0 && isFinite(nisab);
    const zakat = eligible ? netWealth * 0.025 : 0;

    return {
      goldRows, silverRows, totalGoldValue, totalGoldPure, totalSilverValue, totalSilverPure,
      cashAssets, investAssets, bizAssets, otherAssets, totalAssets,
      totalLiab, netWealth, nisabGold, nisabSilver, nisab, eligible, zakat,
    };
  }, [gold, silver, goldPricePerGram, silverPricePerGram, cash, bank, invest, crypto, biz, rental, receivables, debts, billsDue]);

  const updateGold = (id: number, field: keyof GoldItem, v: string) =>
    setGold(gold.map((g) => (g.id === id ? { ...g, [field]: v } : g)));
  const updateSilver = (id: number, field: keyof SilverItem, v: string) =>
    setSilver(silver.map((s) => (s.id === id ? { ...s, [field]: v } : s)));

  return (
    <View className="gap-3">
      {/* Metal prices — compact two-row layout */}
      <Card>
        <View className="flex-row items-center justify-between">
          <Text variant="bodyStrong">Live metal prices</Text>
          <Pressable
            onPress={fetchLive}
            className="flex-row gap-1 items-center px-2 py-1 rounded-pill bg-primary-soft dark:bg-primary-softDark active:opacity-80"
          >
            <Ionicons name="refresh" size={12} color={tokens.primary} />
            <Text variant="caption" tone="primary">{livePriceLoading ? 'Loading' : 'Spot'}</Text>
          </Pressable>
        </View>
        {livePriceErr ? <Text variant="small" tone="danger" className="mt-1">{livePriceErr}</Text> : null}

        <View className="mt-2.5 gap-2.5">
          <View className="flex-row gap-2">
            <View className="flex-[2]">
              <Input label="Gold price" value={goldPrice} onChangeText={setGoldPrice} keyboardType="decimal-pad" />
            </View>
            <View className="flex-1">
              <Picker label="Unit" value={goldPriceUnit} onChange={setGoldPriceUnit} options={PRICE_UNITS} />
            </View>
          </View>
          <View className="flex-row gap-2">
            <View className="flex-[2]">
              <Input label="Silver price" value={silverPrice} onChangeText={setSilverPrice} keyboardType="decimal-pad" />
            </View>
            <View className="flex-1">
              <Picker label="Unit" value={silverPriceUnit} onChange={setSilverPriceUnit} options={PRICE_UNITS} />
            </View>
          </View>
          <Input label="USD → local rate (for live spot)" value={fxUsdLocal} onChangeText={setFxUsdLocal} keyboardType="decimal-pad" hint="278 PKR · 83 INR · 3.67 AED · 1 if entering in USD" />
        </View>
      </Card>

      {/* Gold items */}
      <Card>
        <SectionHeader title={`Gold holdings (${gold.length})`} sub="Each row: weight + karat" open={showGold} onToggle={() => setShowGold(!showGold)} />
        {showGold ? (
          <View className="gap-2.5 mt-2">
            {gold.map((g, i) => (
              <View key={g.id} className="rounded-md border-hairline border-border dark:border-border-dark p-3 gap-2">
                <View className="flex-row items-center gap-2">
                  <View className="flex-1">
                    <Input label={`Item ${i + 1}`} value={g.desc} onChangeText={(v) => updateGold(g.id, 'desc', v)} placeholder="Wedding jewellery, bangles…" />
                  </View>
                  {gold.length > 1 ? (
                    <Pressable onPress={() => setGold(gold.filter((x) => x.id !== g.id))} className="w-8 h-8 rounded-md items-center justify-center bg-danger/10 active:opacity-70">
                      <Ionicons name="close" size={16} color={tokens.danger} />
                    </Pressable>
                  ) : null}
                </View>
                {g.unit === 'tmr' ? (
                  <View className="flex-row gap-2">
                    <View className="flex-1"><Input label="Tola" value={g.tola} onChangeText={(v) => updateGold(g.id, 'tola', v)} keyboardType="decimal-pad" /></View>
                    <View className="flex-1"><Input label="Masha" value={g.masha} onChangeText={(v) => updateGold(g.id, 'masha', v)} keyboardType="decimal-pad" /></View>
                    <View className="flex-1"><Input label="Ratti" value={g.ratti} onChangeText={(v) => updateGold(g.id, 'ratti', v)} keyboardType="decimal-pad" /></View>
                  </View>
                ) : (
                  <Input label="Weight" value={g.weight} onChangeText={(v) => updateGold(g.id, 'weight', v)} keyboardType="decimal-pad" />
                )}
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Picker label="Unit" value={g.unit} onChange={(v) => updateGold(g.id, 'unit', v)} options={WEIGHT_UNITS} />
                  </View>
                  <View className="flex-1">
                    <Picker label="Karat" value={g.karat} onChange={(v) => updateGold(g.id, 'karat', v)} options={KARATS.map(({ label, value }) => ({ label, value }))} />
                  </View>
                </View>
                {result.goldRows[i] && result.goldRows[i].grams > 0 ? (
                  <View className="flex-row gap-2 pt-1 border-t-hairline border-border dark:border-border-dark">
                    <Text variant="caption" tone="muted" className="flex-1">{`${result.goldRows[i].grams.toFixed(2)} g · pure ${result.goldRows[i].pureGrams.toFixed(2)} g`}</Text>
                    <Text variant="caption" tone="primary">{fmt(result.goldRows[i].value)}</Text>
                  </View>
                ) : null}
              </View>
            ))}
            <Button
              title="Add gold item"
              icon="add"
              size="sm"
              variant="secondary"
              fullWidth
              onPress={() => setGold([...gold, { id: Date.now(), desc: '', weight: '', tola: '', masha: '', ratti: '', unit: 'tola', karat: '22' }])}
            />
            <View className="flex-row gap-3 pt-2 border-t-hairline border-border dark:border-border-dark">
              <View className="flex-1"><Text variant="caption" tone="muted">PURE GOLD</Text><Text variant="bodyStrong">{result.totalGoldPure.toFixed(2)} g</Text></View>
              <View className="flex-1"><Text variant="caption" tone="muted">VALUE</Text><Text variant="bodyStrong" tone="primary">{fmt(result.totalGoldValue)}</Text></View>
            </View>
          </View>
        ) : null}
      </Card>

      {/* Silver items */}
      <Card>
        <SectionHeader title={`Silver holdings (${silver.length})`} sub="Each row: weight + purity" open={showSilver} onToggle={() => setShowSilver(!showSilver)} />
        {showSilver ? (
          <View className="gap-2.5 mt-2">
            {silver.map((s, i) => (
              <View key={s.id} className="rounded-md border-hairline border-border dark:border-border-dark p-3 gap-2">
                <View className="flex-row items-center gap-2">
                  <View className="flex-1">
                    <Input label={`Item ${i + 1}`} value={s.desc} onChangeText={(v) => updateSilver(s.id, 'desc', v)} placeholder="Silverware, coins…" />
                  </View>
                  {silver.length > 1 ? (
                    <Pressable onPress={() => setSilver(silver.filter((x) => x.id !== s.id))} className="w-8 h-8 rounded-md items-center justify-center bg-danger/10 active:opacity-70">
                      <Ionicons name="close" size={16} color={tokens.danger} />
                    </Pressable>
                  ) : null}
                </View>
                {s.unit === 'tmr' ? (
                  <View className="flex-row gap-2">
                    <View className="flex-1"><Input label="Tola" value={s.tola} onChangeText={(v) => updateSilver(s.id, 'tola', v)} keyboardType="decimal-pad" /></View>
                    <View className="flex-1"><Input label="Masha" value={s.masha} onChangeText={(v) => updateSilver(s.id, 'masha', v)} keyboardType="decimal-pad" /></View>
                    <View className="flex-1"><Input label="Ratti" value={s.ratti} onChangeText={(v) => updateSilver(s.id, 'ratti', v)} keyboardType="decimal-pad" /></View>
                  </View>
                ) : (
                  <Input label="Weight" value={s.weight} onChangeText={(v) => updateSilver(s.id, 'weight', v)} keyboardType="decimal-pad" />
                )}
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Picker label="Unit" value={s.unit} onChange={(v) => updateSilver(s.id, 'unit', v)} options={WEIGHT_UNITS} />
                  </View>
                  <View className="flex-1">
                    <Picker label="Purity" value={s.purity} onChange={(v) => updateSilver(s.id, 'purity', v)} options={SILVER_PURITIES} />
                  </View>
                </View>
                {result.silverRows[i] && result.silverRows[i].grams > 0 ? (
                  <View className="flex-row gap-2 pt-1 border-t-hairline border-border dark:border-border-dark">
                    <Text variant="caption" tone="muted" className="flex-1">{`${result.silverRows[i].grams.toFixed(2)} g · pure ${result.silverRows[i].pureGrams.toFixed(2)} g`}</Text>
                    <Text variant="caption" tone="primary">{fmt(result.silverRows[i].value)}</Text>
                  </View>
                ) : null}
              </View>
            ))}
            <Button
              title="Add silver item"
              icon="add"
              size="sm"
              variant="secondary"
              fullWidth
              onPress={() => setSilver([...silver, { id: Date.now(), desc: '', weight: '', tola: '', masha: '', ratti: '', unit: 'tola', purity: '92.5' }])}
            />
            <View className="flex-row gap-3 pt-2 border-t-hairline border-border dark:border-border-dark">
              <View className="flex-1"><Text variant="caption" tone="muted">PURE SILVER</Text><Text variant="bodyStrong">{result.totalSilverPure.toFixed(2)} g</Text></View>
              <View className="flex-1"><Text variant="caption" tone="muted">VALUE</Text><Text variant="bodyStrong" tone="primary">{fmt(result.totalSilverValue)}</Text></View>
            </View>
          </View>
        ) : null}
      </Card>

      {/* Cash + assets */}
      <Card>
        <SectionHeader title="Cash & other assets" sub="Held for at least 1 lunar year (Hawl)" open={showCash} onToggle={() => setShowCash(!showCash)} />
        {showCash ? (
          <View className="gap-2.5 mt-2">
            <Input label="Cash in hand" value={cash} onChangeText={setCash} keyboardType="decimal-pad" />
            <Input label="Bank balances" value={bank} onChangeText={setBank} keyboardType="decimal-pad" />
            <Input label="Investments / shares / mutual funds" value={invest} onChangeText={setInvest} keyboardType="decimal-pad" />
            <Input label="Cryptocurrency" value={crypto} onChangeText={setCrypto} keyboardType="decimal-pad" />
            <Input label="Business inventory (sale value)" value={biz} onChangeText={setBiz} keyboardType="decimal-pad" />
            <Input label="Rental income (held)" value={rental} onChangeText={setRental} keyboardType="decimal-pad" />
            <Input label="Loans you've given (receivables)" value={receivables} onChangeText={setReceivables} keyboardType="decimal-pad" />
          </View>
        ) : null}
      </Card>

      {/* Liabilities */}
      <Card>
        <SectionHeader title="Liabilities" sub="Subtracted from gross wealth" open={showLiab} onToggle={() => setShowLiab(!showLiab)} />
        {showLiab ? (
          <View className="gap-2.5 mt-2">
            <Input label="Short-term debts owed" value={debts} onChangeText={setDebts} keyboardType="decimal-pad" />
            <Input label="Bills & due payments" value={billsDue} onChangeText={setBillsDue} keyboardType="decimal-pad" />
          </View>
        ) : null}
      </Card>

      {/* Result panel */}
      <ResultDisplay
        label="Zakat due (2.5%)"
        value={fmt(result.zakat)}
        sub={result.eligible ? `Net wealth ${fmt(result.netWealth)} ≥ Nisab ${fmt(result.nisab)}` : `Net wealth ${fmt(result.netWealth)} < Nisab ${fmt(result.nisab)} — no Zakat owed`}
      />

      {/* Detailed breakdown */}
      <Card variant="subtle">
        <Text variant="bodyStrong">Breakdown</Text>
        <View className="gap-1.5 mt-2">
          <Row label="Cash + bank" value={fmt(result.cashAssets)} />
          <Row label="Gold value" value={fmt(result.totalGoldValue)} />
          <Row label="Silver value" value={fmt(result.totalSilverValue)} />
          <Row label="Investments" value={fmt(result.investAssets)} />
          <Row label="Business" value={fmt(result.bizAssets)} />
          <Row label="Receivables" value={fmt(result.otherAssets)} />
          <View className="border-t-hairline border-border dark:border-border-dark pt-1.5">
            <Row label="TOTAL ASSETS" value={fmt(result.totalAssets)} bold />
          </View>
          <Row label="Liabilities" value={`− ${fmt(result.totalLiab)}`} tone="warning" />
          <View className="border-t-hairline border-border dark:border-border-dark pt-1.5">
            <Row label="NET WEALTH" value={fmt(result.netWealth)} bold />
          </View>
          <View className="pt-2 mt-1 border-t-hairline border-border dark:border-border-dark gap-1">
            <Row label="Nisab (gold)" value={fmt(result.nisabGold)} muted />
            <Row label="Nisab (silver)" value={fmt(result.nisabSilver)} muted />
            <Row label="Nisab applied" value={fmt(result.nisab)} muted />
          </View>
        </View>
      </Card>

      <Card variant="subtle">
        <Text variant="caption" tone="muted">METHOD</Text>
        <Text variant="small" tone="muted" className="mt-1">
          Zakat is 2.5% of net zakatable wealth held for one lunar year (Hawl). The lower of gold (87.48 g) and silver (612.36 g) Nisab is applied to be most generous to the poor.
        </Text>
      </Card>
    </View>
  );
}

// ───────────────────── tiny helpers ─────────────────────
function SectionHeader({ title, sub, open, onToggle }: { title: string; sub?: string; open: boolean; onToggle: () => void }) {
  const { c } = (function useC() {
    const scheme = useColorScheme();
    return { c: scheme === 'dark' ? Colors.dark : Colors.light };
  })();
  return (
    <Pressable onPress={onToggle} className="flex-row items-center gap-2 active:opacity-80">
      <View className="flex-1">
        <Text variant="bodyStrong">{title}</Text>
        {sub ? <Text variant="caption" tone="muted">{sub}</Text> : null}
      </View>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={c.icon} />
    </Pressable>
  );
}

function Row({ label, value, bold, tone, muted }: { label: string; value: string; bold?: boolean; tone?: 'warning'; muted?: boolean }) {
  return (
    <View className="flex-row items-center">
      <Text variant={bold ? 'bodyStrong' : 'small'} tone={muted ? 'muted' : 'default'} className="flex-1">{label}</Text>
      <Text variant={bold ? 'bodyStrong' : 'small'} tone={tone ?? (bold ? 'primary' : muted ? 'muted' : 'default')}>{value}</Text>
    </View>
  );
}
