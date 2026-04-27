import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { ResultDisplay } from '@/components/ui/ResultDisplay';
import { Picker } from '@/components/ui/Picker';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';

const num = (s: string) => parseFloat(s);
const ok = (...v: number[]) => v.every((x) => isFinite(x));

// 1. WallpaperCalculator
export function WallpaperCalculator() {
  const [length, setL] = useState('15');
  const [width, setW] = useState('12');
  const [height, setH] = useState('9');
  const [rollW, setRollW] = useState('21');
  const [rollL, setRollL] = useState('33');
  const [repeat, setRepeat] = useState('0');

  const out = useMemo(() => {
    const l = num(length); const w = num(width); const h = num(height);
    const rw = num(rollW); const rl = num(rollL); const rp = num(repeat);
    if (!ok(l, w, h, rw, rl, rp) || rw <= 0 || rl <= 0) return null;
    const wallArea = 2 * (l + w) * h;
    const rollArea = (rw / 12) * rl; // sq ft per roll (raw)
    // Pattern repeat waste: 5% if repeat 0, scales up to 15% at repeat>=24
    const wasteFactor = Math.min(0.15, 0.05 + (rp / 24) * 0.1);
    const usable = rollArea * (1 - wasteFactor);
    const rolls = Math.ceil(wallArea / usable);
    return { wallArea, rollArea, usable, rolls, wasteFactor };
  }, [length, width, height, rollW, rollL, repeat]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Length (ft)" value={length} onChangeText={setL} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Width (ft)" value={width} onChangeText={setW} keyboardType="decimal-pad" /></View>
          </View>
          <Input label="Wall height (ft)" value={height} onChangeText={setH} keyboardType="decimal-pad" />
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Roll width (in)" value={rollW} onChangeText={setRollW} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Roll length (ft)" value={rollL} onChangeText={setRollL} keyboardType="decimal-pad" /></View>
          </View>
          <Input label="Pattern repeat (in)" value={repeat} onChangeText={setRepeat} keyboardType="decimal-pad" hint="0 for no repeat. Larger repeat = more waste." />
        </View>
      </Card>
      <ResultDisplay
        label="Rolls needed"
        value={out ? out.rolls.toString() : '—'}
        sub={out ? `Wall area: ${out.wallArea.toFixed(1)} sq ft · Usable per roll: ${out.usable.toFixed(1)} sq ft (${(out.wasteFactor * 100).toFixed(0)}% waste)` : undefined}
      />
    </View>
  );
}

// 2. FlooringCalculator
export function FlooringCalculator() {
  const [length, setL] = useState('15');
  const [width, setW] = useState('12');
  const [boxCov, setBoxCov] = useState('25');
  const [waste, setWaste] = useState('10');
  const [pricePerBox, setPrice] = useState('45');

  const out = useMemo(() => {
    const l = num(length); const w = num(width); const bc = num(boxCov);
    const ws = num(waste); const p = num(pricePerBox);
    if (!ok(l, w, bc, ws, p) || bc <= 0) return null;
    const floorArea = l * w;
    const totalArea = floorArea * (1 + ws / 100);
    const boxes = Math.ceil(totalArea / bc);
    const cost = boxes * p;
    return { floorArea, totalArea, boxes, cost };
  }, [length, width, boxCov, waste, pricePerBox]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Length (ft)" value={length} onChangeText={setL} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Width (ft)" value={width} onChangeText={setW} keyboardType="decimal-pad" /></View>
          </View>
          <Input label="Box coverage (sq ft)" value={boxCov} onChangeText={setBoxCov} keyboardType="decimal-pad" />
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Waste %" value={waste} onChangeText={setWaste} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Price per box" value={pricePerBox} onChangeText={setPrice} keyboardType="decimal-pad" /></View>
          </View>
        </View>
      </Card>
      <ResultDisplay
        label="Boxes needed"
        value={out ? out.boxes.toString() : '—'}
        sub={out ? `Floor: ${out.floorArea.toFixed(1)} sq ft · With waste: ${out.totalArea.toFixed(1)} sq ft` : undefined}
      />
      {out ? (
        <Card variant="subtle">
          <Text variant="caption" tone="muted">TOTAL COST</Text>
          <Text variant="h2">${out.cost.toFixed(2)}</Text>
        </Card>
      ) : null}
    </View>
  );
}

// 3. SolarPanelCalculator
export function SolarPanelCalculator() {
  const [bill, setBill] = useState('150');
  const [rate, setRate] = useState('0.15');
  const [sunHours, setSun] = useState('5');
  const [panelW, setPanelW] = useState('400');
  const [costPerW, setCostPerW] = useState('1.5');
  const [gridRate, setGrid] = useState('0.15');

  const out = useMemo(() => {
    const b = num(bill); const r = num(rate); const sh = num(sunHours);
    const pw = num(panelW); const cw = num(costPerW); const gr = num(gridRate);
    if (!ok(b, r, sh, pw, cw, gr) || r <= 0 || sh <= 0 || pw <= 0) return null;
    const monthlyKWh = b / r;
    const dailyKWh = monthlyKWh / 30;
    const systemKW = dailyKWh / sh;
    const systemW = systemKW * 1000;
    const panels = Math.ceil(systemW / pw);
    const totalSystemW = panels * pw;
    const systemCost = totalSystemW * cw;
    const monthlyGen = (totalSystemW / 1000) * sh * 30;
    const monthlySavings = monthlyGen * gr;
    const paybackMonths = monthlySavings > 0 ? systemCost / monthlySavings : Infinity;
    return { monthlyKWh, dailyKWh, systemKW, panels, totalSystemW, systemCost, monthlyGen, monthlySavings, paybackMonths };
  }, [bill, rate, sunHours, panelW, costPerW, gridRate]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Monthly bill ($)" value={bill} onChangeText={setBill} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Rate ($/kWh)" value={rate} onChangeText={setRate} keyboardType="decimal-pad" /></View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Sun hours / day" value={sunHours} onChangeText={setSun} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Panel wattage (W)" value={panelW} onChangeText={setPanelW} keyboardType="decimal-pad" /></View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="System cost ($/W)" value={costPerW} onChangeText={setCostPerW} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Grid cost ($/kWh)" value={gridRate} onChangeText={setGrid} keyboardType="decimal-pad" /></View>
          </View>
        </View>
      </Card>
      <ResultDisplay
        label="Panels needed"
        value={out ? out.panels.toString() : '—'}
        sub={out ? `${(out.totalSystemW / 1000).toFixed(2)} kW system · ${out.monthlyKWh.toFixed(0)} kWh/mo usage` : undefined}
      />
      {out ? (
        <Card variant="subtle">
          <View className="flex-row gap-3">
            <View className="flex-1"><Text variant="caption" tone="muted">SYSTEM COST</Text><Text variant="h3">${out.systemCost.toFixed(0)}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">SAVINGS / MO</Text><Text variant="h3">${out.monthlySavings.toFixed(0)}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">PAYBACK</Text><Text variant="h3">{isFinite(out.paybackMonths) ? `${(out.paybackMonths / 12).toFixed(1)} yr` : '—'}</Text></View>
          </View>
          <Text variant="small" tone="muted" className="mt-2">Generation: {out.monthlyGen.toFixed(0)} kWh/mo</Text>
        </Card>
      ) : null}
    </View>
  );
}

// 4. RoofingCalculator
type RoofType = 'gable' | 'hip' | 'shed';
export function RoofingCalculator() {
  const [type, setType] = useState<RoofType>('gable');
  const [length, setL] = useState('40');
  const [width, setW] = useState('30');
  const [pitch, setPitch] = useState('4');

  const out = useMemo(() => {
    const l = num(length); const w = num(width); const p = num(pitch);
    if (!ok(l, w, p)) return null;
    const baseArea = l * w;
    const slopeFactor = Math.sqrt(1 + Math.pow(p / 12, 2));
    // Hip roofs need ~5% more material due to extra cuts/hips; shed is single plane.
    const typeFactor = type === 'hip' ? 1.05 : 1;
    const surface = baseArea * slopeFactor * typeFactor;
    const squares = surface / 100;
    const bundles = Math.ceil(squares * 3);
    return { baseArea, slopeFactor, surface, squares, bundles };
  }, [type, length, width, pitch]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Picker
            label="Roof type"
            value={type}
            onChange={(v) => setType(v as RoofType)}
            options={[
              { label: 'Gable', value: 'gable' },
              { label: 'Hip', value: 'hip' },
              { label: 'Shed', value: 'shed' },
            ]}
          />
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Length (ft)" value={length} onChangeText={setL} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Width (ft)" value={width} onChangeText={setW} keyboardType="decimal-pad" /></View>
          </View>
          <Input label="Pitch (rise per 12)" value={pitch} onChangeText={setPitch} keyboardType="decimal-pad" hint="e.g. 4 means 4-in-12 slope." />
        </View>
      </Card>
      <ResultDisplay
        label="Roof surface area"
        value={out ? `${out.surface.toFixed(1)} sq ft` : '—'}
        sub={out ? `Slope factor: ${out.slopeFactor.toFixed(3)} · Footprint: ${out.baseArea.toFixed(0)} sq ft` : undefined}
      />
      {out ? (
        <Card variant="subtle">
          <View className="flex-row gap-3">
            <View className="flex-1"><Text variant="caption" tone="muted">SQUARES</Text><Text variant="h3">{out.squares.toFixed(2)}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">BUNDLES</Text><Text variant="h3">{out.bundles}</Text></View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// 5. StairCalculator
export function StairCalculator() {
  const [rise, setRise] = useState('108');
  const [run, setRun] = useState('');
  const [preferRiser, setPref] = useState('7');

  const out = useMemo(() => {
    const r = num(rise); const pr = num(preferRiser);
    if (!ok(r, pr) || r <= 0 || pr <= 0) return null;
    const risers = Math.max(1, Math.round(r / pr));
    const riserH = r / risers;
    const treads = risers - 1;
    const treadDepth = 25 - 2 * riserH;
    const totalRunUser = num(run);
    const totalRun = isFinite(totalRunUser) && totalRunUser > 0 ? totalRunUser : treads * treadDepth;
    const stringer = Math.sqrt(r * r + totalRun * totalRun);
    const validRiser = riserH >= 4 && riserH <= 7.75;
    const validTread = treadDepth >= 10 && treadDepth <= 11;
    return { risers, riserH, treads, treadDepth, totalRun, stringer, validRiser, validTread };
  }, [rise, run, preferRiser]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <Input label="Total rise (in)" value={rise} onChangeText={setRise} keyboardType="decimal-pad" />
          <Input label="Total run (in, optional)" value={run} onChangeText={setRun} keyboardType="decimal-pad" hint="Leave blank to auto-calc from ideal tread depth." />
          <Input label="Preferred riser height (in)" value={preferRiser} onChangeText={setPref} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay
        label="Risers / Treads"
        value={out ? `${out.risers} / ${out.treads}` : '—'}
        sub={out ? `Riser: ${out.riserH.toFixed(2)}" · Tread: ${out.treadDepth.toFixed(2)}"` : undefined}
      />
      {out ? (
        <Card variant="subtle">
          <View className="flex-row gap-3">
            <View className="flex-1"><Text variant="caption" tone="muted">TOTAL RUN</Text><Text variant="h3">{`${out.totalRun.toFixed(1)} in`}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">STRINGER</Text><Text variant="h3">{`${out.stringer.toFixed(1)} in`}</Text></View>
          </View>
          {(!out.validRiser || !out.validTread) ? (
            <Text variant="small" tone="warning" className="mt-2">
              {`IRC: riser 4–7.75 in · tread 10–11 in min. ${!out.validRiser ? 'Riser out of range. ' : ''}${!out.validTread ? 'Tread out of range.' : ''}`}
            </Text>
          ) : (
            <Text variant="small" tone="success" className="mt-2">{`Within IRC code: riser 4–7.75 in · tread 10–11 in.`}</Text>
          )}
        </Card>
      ) : null}
    </View>
  );
}

// 6. FenceCalculator
export function FenceCalculator() {
  const [length, setL] = useState('100');
  const [spacing, setSpacing] = useState('8');
  const [gates, setGates] = useState('1');
  const [panelCost, setPanelCost] = useState('60');
  const [postCost, setPostCost] = useState('20');
  const [bagsPerPost, setBags] = useState('1');

  const out = useMemo(() => {
    const l = num(length); const sp = num(spacing); const g = num(gates);
    const pc = num(panelCost); const ptc = num(postCost); const b = num(bagsPerPost);
    if (!ok(l, sp, g, pc, ptc, b) || sp <= 0) return null;
    const panels = Math.ceil(l / sp);
    const posts = panels + 1 + Math.max(0, Math.floor(g));
    const rails = panels * 3;
    const bags = posts * b;
    const panelTotal = panels * pc;
    const postTotal = posts * ptc;
    const totalCost = panelTotal + postTotal;
    return { posts, panels, rails, bags, panelTotal, postTotal, totalCost };
  }, [length, spacing, gates, panelCost, postCost, bagsPerPost]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Total length (ft)" value={length} onChangeText={setL} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Post spacing (ft)" value={spacing} onChangeText={setSpacing} keyboardType="decimal-pad" /></View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Gates" value={gates} onChangeText={setGates} keyboardType="numeric" /></View>
            <View className="flex-1"><Input label="Bags / post" value={bagsPerPost} onChangeText={setBags} keyboardType="decimal-pad" /></View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Panel cost ($)" value={panelCost} onChangeText={setPanelCost} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Post cost ($)" value={postCost} onChangeText={setPostCost} keyboardType="decimal-pad" /></View>
          </View>
        </View>
      </Card>
      <ResultDisplay
        label="Posts / Panels"
        value={out ? `${out.posts} / ${out.panels}` : '—'}
        sub={out ? `Rails: ${out.rails} · Concrete bags: ${out.bags.toFixed(0)}` : undefined}
      />
      {out ? (
        <Card variant="subtle">
          <Text variant="bodyStrong">Cost breakdown</Text>
          <View className="flex-row mt-2 gap-3">
            <View className="flex-1"><Text variant="caption" tone="muted">PANELS</Text><Text variant="h3">${out.panelTotal.toFixed(0)}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">POSTS</Text><Text variant="h3">${out.postTotal.toFixed(0)}</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">TOTAL</Text><Text variant="h3">${out.totalCost.toFixed(0)}</Text></View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// 7. LumberBoardFeetCalculator
export function LumberBoardFeetCalculator() {
  const [thick, setT] = useState('2');
  const [width, setW] = useState('6');
  const [length, setL] = useState('8');
  const [pieces, setP] = useState('10');
  const [pricePerBf, setPrice] = useState('1.50');

  const out = useMemo(() => {
    const t = num(thick); const w = num(width); const l = num(length);
    const p = num(pieces); const pr = num(pricePerBf);
    if (!ok(t, w, l, p, pr)) return null;
    const bfPiece = (t * w * l) / 12;
    const totalBf = p * bfPiece;
    const cost = totalBf * pr;
    return { bfPiece, totalBf, cost };
  }, [thick, width, length, pieces, pricePerBf]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Thickness (in)" value={thick} onChangeText={setT} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Width (in)" value={width} onChangeText={setW} keyboardType="decimal-pad" /></View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Length (ft)" value={length} onChangeText={setL} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Pieces" value={pieces} onChangeText={setP} keyboardType="numeric" /></View>
          </View>
          <Input label="Price per board foot ($)" value={pricePerBf} onChangeText={setPrice} keyboardType="decimal-pad" />
        </View>
      </Card>
      <ResultDisplay
        label="Total board feet"
        value={out ? out.totalBf.toFixed(2) : '—'}
        sub={out ? `${out.bfPiece.toFixed(2)} bf / piece · Cost: $${out.cost.toFixed(2)}` : undefined}
      />
    </View>
  );
}

// 8. DrywallCalculator
export function DrywallCalculator() {
  const [length, setL] = useState('15');
  const [width, setW] = useState('12');
  const [height, setH] = useState('9');
  const [includeCeil, setInc] = useState<'yes' | 'no'>('yes');
  const [sheetArea, setSA] = useState('32');

  const out = useMemo(() => {
    const l = num(length); const w = num(width); const h = num(height);
    const sa = num(sheetArea);
    if (!ok(l, w, h, sa) || sa <= 0) return null;
    const wallArea = 2 * (l + w) * h;
    const ceilArea = includeCeil === 'yes' ? l * w : 0;
    const totalArea = wallArea + ceilArea;
    const sheets = Math.ceil((totalArea / sa) * 1.1);
    const compoundBags = Math.ceil(sheets / 12);
    const tapeRolls = Math.ceil(sheets / 14);
    const screws = Math.ceil(sheets * 35);
    return { wallArea, ceilArea, totalArea, sheets, compoundBags, tapeRolls, screws };
  }, [length, width, height, includeCeil, sheetArea]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Length (ft)" value={length} onChangeText={setL} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Width (ft)" value={width} onChangeText={setW} keyboardType="decimal-pad" /></View>
          </View>
          <Input label="Ceiling height (ft)" value={height} onChangeText={setH} keyboardType="decimal-pad" />
          <View>
            <Text variant="caption" tone="muted">INCLUDE CEILING</Text>
            <View className="mt-1.5">
              <SegmentedControl
                value={includeCeil}
                onChange={setInc}
                options={[
                  { label: 'Yes', value: 'yes' },
                  { label: 'No', value: 'no' },
                ]}
              />
            </View>
          </View>
          <Input label="Sheet area (sq ft)" value={sheetArea} onChangeText={setSA} keyboardType="decimal-pad" hint="Default 32 sq ft (4×8 sheet)." />
        </View>
      </Card>
      <ResultDisplay
        label="Sheets needed"
        value={out ? out.sheets.toString() : '—'}
        sub={out ? `Total area: ${out.totalArea.toFixed(0)} sq ft (incl. 10% waste)` : undefined}
      />
      {out ? (
        <Card variant="subtle">
          <Text variant="bodyStrong">Materials</Text>
          <View className="flex-row mt-2 gap-3">
            <View className="flex-1"><Text variant="caption" tone="muted">COMPOUND</Text><Text variant="h3">{out.compoundBags} bags</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">TAPE</Text><Text variant="h3">{out.tapeRolls} rolls</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">SCREWS</Text><Text variant="h3">{out.screws}</Text></View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// 9. GravelSandCalculator
type Unit = 'imperial' | 'metric';
type Material = 'gravel' | 'sand' | 'topsoil' | 'mulch';
const MATERIAL_DENSITY: Record<Material, number> = {
  gravel: 1.5,
  sand: 1.4,
  topsoil: 1.3,
  mulch: 0.8,
};

export function GravelSandCalculator() {
  const [unit, setUnit] = useState<Unit>('imperial');
  const [length, setL] = useState('20');
  const [width, setW] = useState('10');
  const [depth, setDepth] = useState('4');
  const [material, setMaterial] = useState<Material>('gravel');

  const out = useMemo(() => {
    const l = num(length); const w = num(width); const d = num(depth);
    if (!ok(l, w, d)) return null;
    let cuft: number;
    if (unit === 'imperial') {
      // depth in inches → feet
      cuft = l * w * (d / 12);
    } else {
      // metric: l, w in meters; depth in cm → m
      const cum = l * w * (d / 100);
      cuft = cum / 0.0283168;
    }
    const cuyd = cuft / 27;
    const cum = cuft * 0.0283168;
    const density = MATERIAL_DENSITY[material]; // tons per cubic yard
    const tonsShort = cuyd * density; // short tons (US)
    const tonnes = tonsShort * 0.907185; // metric tonnes
    const pounds = tonsShort * 2000;
    return { cuft, cuyd, cum, tonnes, pounds };
  }, [unit, length, width, depth, material]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <View>
            <Text variant="caption" tone="muted">UNITS</Text>
            <View className="mt-1.5">
              <SegmentedControl
                value={unit}
                onChange={setUnit}
                options={[
                  { label: 'Imperial (ft / in)', value: 'imperial' },
                  { label: 'Metric (m / cm)', value: 'metric' },
                ]}
              />
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label={`Length (${unit === 'imperial' ? 'ft' : 'm'})`} value={length} onChangeText={setL} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label={`Width (${unit === 'imperial' ? 'ft' : 'm'})`} value={width} onChangeText={setW} keyboardType="decimal-pad" /></View>
          </View>
          <Input label={`Depth (${unit === 'imperial' ? 'in' : 'cm'})`} value={depth} onChangeText={setDepth} keyboardType="decimal-pad" />
          <Picker
            label="Material"
            value={material}
            onChange={(v) => setMaterial(v as Material)}
            options={[
              { label: 'Gravel', value: 'gravel', sublabel: '1.5 tons / yd³' },
              { label: 'Sand', value: 'sand', sublabel: '1.4 tons / yd³' },
              { label: 'Topsoil', value: 'topsoil', sublabel: '1.3 tons / yd³' },
              { label: 'Mulch', value: 'mulch', sublabel: '0.8 tons / yd³' },
            ]}
          />
        </View>
      </Card>
      <ResultDisplay
        label="Volume"
        value={out ? `${out.cuyd.toFixed(2)} yd³` : '—'}
        sub={out ? `${out.cum.toFixed(2)} m³ · ${out.cuft.toFixed(1)} cu ft` : undefined}
      />
      {out ? (
        <Card variant="subtle">
          <View className="flex-row gap-3">
            <View className="flex-1"><Text variant="caption" tone="muted">WEIGHT</Text><Text variant="h3">{out.tonnes.toFixed(2)} t</Text></View>
            <View className="flex-1"><Text variant="caption" tone="muted">POUNDS</Text><Text variant="h3">{out.pounds.toFixed(0)} lb</Text></View>
          </View>
        </Card>
      ) : null}
    </View>
  );
}

// 10. HvacBtuCalculator
type Sun = 'shade' | 'normal' | 'sunny';
type Insulation = 'poor' | 'average' | 'good';
type Climate = 'cool' | 'moderate' | 'hot';
export function HvacBtuCalculator() {
  const [length, setL] = useState('15');
  const [width, setW] = useState('12');
  const [ceil, setCeil] = useState('9');
  const [windows, setWin] = useState('2');
  const [people, setPpl] = useState('2');
  const [sun, setSun] = useState<Sun>('normal');
  const [insul, setInsul] = useState<Insulation>('average');
  const [climate, setClimate] = useState<Climate>('moderate');

  const out = useMemo(() => {
    const l = num(length); const w = num(width); const c = num(ceil);
    const win = num(windows); const ppl = num(people);
    if (!ok(l, w, c, win, ppl)) return null;
    const sqft = l * w;
    const climateFactor = climate === 'cool' ? 0.9 : climate === 'hot' ? 1.15 : 1;
    const sunFactor = sun === 'shade' ? 0.9 : sun === 'sunny' ? 1.1 : 1;
    const insulFactor = insul === 'poor' ? 1.15 : insul === 'good' ? 0.95 : 1;
    const extraPpl = Math.max(0, ppl - 2) * 600;
    const extraWin = Math.max(0, win - 2) * 1000;
    const ceilFactor = c / 8; // baseline 8ft

    const cooling = sqft * 25 * climateFactor * sunFactor * insulFactor * ceilFactor + extraPpl + extraWin;
    const heating = sqft * 30 * climateFactor * sunFactor * insulFactor * ceilFactor + extraPpl + extraWin;
    return { sqft, cooling, heating };
  }, [length, width, ceil, windows, people, sun, insul, climate]);

  return (
    <View className="gap-3">
      <Card>
        <View className="gap-3">
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Length (ft)" value={length} onChangeText={setL} keyboardType="decimal-pad" /></View>
            <View className="flex-1"><Input label="Width (ft)" value={width} onChangeText={setW} keyboardType="decimal-pad" /></View>
          </View>
          <Input label="Ceiling (ft)" value={ceil} onChangeText={setCeil} keyboardType="decimal-pad" />
          <View className="flex-row gap-3">
            <View className="flex-1"><Input label="Windows" value={windows} onChangeText={setWin} keyboardType="numeric" /></View>
            <View className="flex-1"><Input label="People" value={people} onChangeText={setPpl} keyboardType="numeric" /></View>
          </View>
          <View>
            <Text variant="caption" tone="muted">SUN EXPOSURE</Text>
            <View className="mt-1.5">
              <SegmentedControl
                value={sun}
                onChange={setSun}
                options={[
                  { label: 'Shade', value: 'shade' },
                  { label: 'Normal', value: 'normal' },
                  { label: 'Sunny', value: 'sunny' },
                ]}
              />
            </View>
          </View>
          <Picker
            label="Insulation"
            value={insul}
            onChange={(v) => setInsul(v as Insulation)}
            options={[
              { label: 'Poor', value: 'poor' },
              { label: 'Average', value: 'average' },
              { label: 'Good', value: 'good' },
            ]}
          />
          <Picker
            label="Climate"
            value={climate}
            onChange={(v) => setClimate(v as Climate)}
            options={[
              { label: 'Cool', value: 'cool' },
              { label: 'Moderate', value: 'moderate' },
              { label: 'Hot', value: 'hot' },
            ]}
          />
        </View>
      </Card>
      <ResultDisplay
        label="Cooling capacity"
        value={out ? `${Math.round(out.cooling).toLocaleString()} BTU/hr` : '—'}
        sub={out ? `Room: ${out.sqft.toFixed(0)} sq ft` : undefined}
      />
      {out ? (
        <Card variant="subtle">
          <Text variant="caption" tone="muted">HEATING CAPACITY</Text>
          <Text variant="h2">{Math.round(out.heating).toLocaleString()} BTU/hr</Text>
        </Card>
      ) : null}
    </View>
  );
}

// 11. RoomAreaCalculator
type Room = { id: string; name: string; length: string; width: string };
let _rid = 0;
const newId = () => `r${++_rid}`;

export function RoomAreaCalculator() {
  const [rooms, setRooms] = useState<Room[]>([
    { id: newId(), name: 'Living', length: '20', width: '15' },
    { id: newId(), name: 'Bedroom', length: '12', width: '10' },
  ]);

  const updateRoom = (id: string, patch: Partial<Room>) => {
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const addRoom = () => setRooms((rs) => [...rs, { id: newId(), name: `Room ${rs.length + 1}`, length: '10', width: '10' }]);
  const removeRoom = (id: string) => setRooms((rs) => rs.filter((r) => r.id !== id));

  const computed = useMemo(() => {
    const list = rooms.map((r) => {
      const l = num(r.length); const w = num(r.width);
      const sqft = ok(l, w) ? l * w : 0;
      return { ...r, sqft, m2: sqft * 0.092903 };
    });
    const totalSqft = list.reduce((a, b) => a + b.sqft, 0);
    const totalM2 = totalSqft * 0.092903;
    return { list, totalSqft, totalM2 };
  }, [rooms]);

  return (
    <View className="gap-3">
      {computed.list.map((r) => (
        <Card key={r.id}>
          <View className="gap-3">
            <Input label="Room name" value={r.name} onChangeText={(v) => updateRoom(r.id, { name: v })} />
            <View className="flex-row gap-3">
              <View className="flex-1"><Input label="Length (ft)" value={r.length} onChangeText={(v) => updateRoom(r.id, { length: v })} keyboardType="decimal-pad" /></View>
              <View className="flex-1"><Input label="Width (ft)" value={r.width} onChangeText={(v) => updateRoom(r.id, { width: v })} keyboardType="decimal-pad" /></View>
            </View>
            <View className="flex-row items-center justify-between">
              <Text variant="small" tone="muted">{r.sqft.toFixed(1)} sq ft · {r.m2.toFixed(2)} m²</Text>
              <Button title="Remove" variant="secondary" size="sm" icon="trash-outline" onPress={() => removeRoom(r.id)} disabled={rooms.length <= 1} />
            </View>
          </View>
        </Card>
      ))}
      <Button title="Add room" variant="secondary" icon="add" onPress={addRoom} fullWidth />
      <ResultDisplay
        label="Grand total"
        value={`${computed.totalSqft.toFixed(1)} sq ft`}
        sub={`${computed.totalM2.toFixed(2)} m² · ${computed.list.length} room${computed.list.length === 1 ? '' : 's'}`}
      />
    </View>
  );
}
