import type { ComponentType } from 'react';
import { UNIT_CONFIGS } from '@/constants/unit-configs';

import { UnitConverter } from './UnitConverter';
import { TemperatureConverter } from './TemperatureConverter';
import { BmiCalculator } from './BmiCalculator';
import { BmrCalculator } from './BmrCalculator';
import { BodyFatCalculator } from './BodyFatCalculator';
import { LoanCalculator } from './LoanCalculator';
import { PercentageCalculator } from './PercentageCalculator';
import { TipCalculator } from './TipCalculator';
import { DiscountCalculator } from './DiscountCalculator';
import { CompoundInterestCalculator } from './CompoundInterestCalculator';
import { CurrencyConverter } from './CurrencyConverter';
import { GstCalculator } from './GstCalculator';
import { ScientificCalculator } from './ScientificCalculator';
import { FractionCalculator } from './FractionCalculator';
import { AgeCalculator } from './AgeCalculator';
import { DateDifferenceCalculator } from './DateDifferenceCalculator';
import { ZakatCalculator } from './ZakatCalculator';
import { MahrCalculator } from './MahrCalculator';
import { QurbaniCostCalculator } from './QurbaniCostCalculator';
import { HijriDateToday } from './HijriDateToday';
import { PlotAreaCalculator } from './PlotAreaCalculator';
import {
  AverageCalculator,
  LcmGcdCalculator,
  ExponentCalculator,
  SquareRootCalculator,
  PrimeChecker,
  LogarithmCalculator,
  RatioCalculator,
} from './MathCalculators';
import {
  QuadraticSolver, TriangleSolver, TrigonometryCalculator,
  PermutationCombinationCalculator, SequenceSumsCalculator,
  StandardDeviationCalculator, StatisticsBatchCalculator,
  DistanceMidpointCalculator, BaseConverter,
} from './MathBatch';
import {
  TileCalculator,
  PaintCalculator,
  BrickCalculator,
  SquareFootageCalculator,
  ConcreteCalculator,
} from './ConstructionCalculators';
import {
  WallpaperCalculator, FlooringCalculator, SolarPanelCalculator, RoofingCalculator,
  StairCalculator, FenceCalculator, LumberBoardFeetCalculator, DrywallCalculator,
  GravelSandCalculator, HvacBtuCalculator, RoomAreaCalculator,
} from './ConstructionBatch';
import {
  PasswordGenerator,
  Base64Converter,
  WordCounter,
  CaseConverter,
  TextReverser,
} from './UtilityCalculators';
import {
  HashCalculator, UuidGenerator, UnixTimestampConverter, LoremIpsumGenerator,
  JsonCsvConverter, JsonYamlConverter, MarkdownConverter, ColorConverter,
  UrlEncoderConverter, RegexTester, IbanValidator,
} from './UtilityBatch';
import {
  ZodiacCalculator,
  ChineseZodiacCalculator,
  MagicEightBall,
  CoinDiceRoller,
  NumerologyCalculator,
} from './FunCalculators';
import {
  IdealWeightCalculator,
  HeartRateZoneCalculator,
  PaceCalculator,
  WaterIntakeCalculator,
  WorkingDaysCalculator,
  AddSubtractDays,
  TimeDurationCalculator,
  CountdownTimer,
  ProfitMarginCalculator,
  MarkupCalculator,
  SalaryCalculator,
  CostPerUnitCalculator,
} from './MoreCalculators';
import {
  TdeeCalculator, MacroCalculator, CaloriesBurnedCalculator,
  PregnancyDueDateCalculator, OvulationCalculator, LeanBodyMassCalculator,
  WaistHipRatioCalculator, BacCalculator, BloodPressureCalculator,
  SleepCycleCalculator, EgfrCalculator, BsaCalculator,
  ChildBmiPercentileCalculator, ChronologicalAgeCalculator, ProteinIntakeCalculator,
} from './HealthBatch';
import { SalahTimesCalculator } from './SalahTimesCalculator';
import {
  LiveGoldRatesTool, GoldPriceCalculator, SilverPriceCalculator,
  GoldPurityCalculator, KaratAdjustmentCalculator, GoldWeightArithmeticCalculator,
  GoldSilverUnitConverter, GoldRateFinder,
} from './GoldSilverCalculators';
import {
  HijriGregorianConverter, SehriIftarScheduleCalculator, FaraizCalculator,
} from './IslamicBatch';
import {
  TimeZoneConverter, WorldClock, PomodoroTimer,
} from './DateTimeBatch';
import {
  IncomeTaxCalculatorPK, VehicleTokenTaxPkCalculator,
  PropertyRegistrationTaxPkCalculator, BreakEvenCalculator,
  GpaCalculator, GradeCalculator,
} from './FinancialBatch';
import {
  DecisionWheel, BirthdayParadoxCalculator, AgeOnPlanetsCalculator,
  CatAgeCalculator, DogAgeCalculator,
} from './FunBatch';
import {
  AngleConverter, WindSpeedConverter, CookingMeasurementConverter,
  HeatIndexCalculator, DaysUntilCalculator, OneRepMaxCalculator,
  PregnancyWeightGainCalculator, QiblaDirectionFinder, QrCodeGenerator,
  BarcodeGenerator, SolidVolumeCalculator, StudentResultCard,
  Vo2MaxCalculator, ImageFormatConverter,
} from './RemainingBatch';
import { NotFound } from './NotFound';

export type CalcRegistryEntry = ComponentType<{ slug: string }>;

const directRegistry: Record<string, CalcRegistryEntry> = {
  // Unit
  'temperature-converter': TemperatureConverter,
  // Health
  'bmi-calculator': BmiCalculator,
  'bmr-calculator': BmrCalculator,
  'body-fat-calculator': BodyFatCalculator,
  'ideal-weight-calculator': IdealWeightCalculator,
  'heart-rate-zone-calculator': HeartRateZoneCalculator,
  'pace-calculator': PaceCalculator,
  'water-intake-calculator': WaterIntakeCalculator,
  'tdee-calculator': TdeeCalculator,
  'macro-calculator': MacroCalculator,
  'calories-burned-calculator': CaloriesBurnedCalculator,
  'pregnancy-due-date-calculator': PregnancyDueDateCalculator,
  'ovulation-calculator': OvulationCalculator,
  'lean-body-mass-calculator': LeanBodyMassCalculator,
  'waist-hip-ratio-calculator': WaistHipRatioCalculator,
  'bac-calculator': BacCalculator,
  'blood-pressure-calculator': BloodPressureCalculator,
  'sleep-cycle-calculator': SleepCycleCalculator,
  'egfr-calculator': EgfrCalculator,
  'bsa-calculator': BsaCalculator,
  'child-bmi-percentile-calculator': ChildBmiPercentileCalculator,
  'chronological-age-calculator': ChronologicalAgeCalculator,
  'protein-intake-calculator': ProteinIntakeCalculator,
  // Financial
  'loan-emi-calculator': LoanCalculator,
  'percentage-calculator': PercentageCalculator,
  'tip-calculator': TipCalculator,
  'discount-calculator': DiscountCalculator,
  'compound-interest-calculator': CompoundInterestCalculator,
  'currency-converter': CurrencyConverter,
  'gst-calculator': GstCalculator,
  'profit-margin-calculator': ProfitMarginCalculator,
  'markup-calculator': MarkupCalculator,
  'salary-calculator': SalaryCalculator,
  'cost-per-unit-calculator': CostPerUnitCalculator,
  // Math
  'scientific-calculator': ScientificCalculator,
  'fraction-calculator': FractionCalculator,
  'average-calculator': AverageCalculator,
  'lcm-gcd-calculator': LcmGcdCalculator,
  'exponent-calculator': ExponentCalculator,
  'square-root-calculator': SquareRootCalculator,
  'prime-checker': PrimeChecker,
  'logarithm-calculator': LogarithmCalculator,
  'ratio-calculator': RatioCalculator,
  'quadratic-solver': QuadraticSolver,
  'triangle-solver': TriangleSolver,
  'trigonometry-calculator': TrigonometryCalculator,
  'permutation-combination-calculator': PermutationCombinationCalculator,
  'sequence-sums-calculator': SequenceSumsCalculator,
  'standard-deviation-calculator': StandardDeviationCalculator,
  'statistics-batch-calculator': StatisticsBatchCalculator,
  'distance-midpoint-calculator': DistanceMidpointCalculator,
  'base-converter': BaseConverter,
  // Financial extras (PK)
  'income-tax-calculator-pakistan': IncomeTaxCalculatorPK,
  'vehicle-token-tax-pk-calculator': VehicleTokenTaxPkCalculator,
  'property-registration-tax-pk-calculator': PropertyRegistrationTaxPkCalculator,
  'break-even-calculator': BreakEvenCalculator,
  'gpa-calculator': GpaCalculator,
  'grade-calculator': GradeCalculator,
  // Date & Time
  'age-calculator': AgeCalculator,
  'date-difference-calculator': DateDifferenceCalculator,
  'working-days-calculator': WorkingDaysCalculator,
  'add-subtract-days-calculator': AddSubtractDays,
  'time-duration-calculator': TimeDurationCalculator,
  'countdown-timer': CountdownTimer,
  'time-zone-converter': TimeZoneConverter,
  'world-clock': WorldClock,
  'pomodoro-timer': PomodoroTimer,
  // Islamic
  'zakat-calculator': ZakatCalculator,
  'mahr-calculator': MahrCalculator,
  'qurbani-cost-calculator': QurbaniCostCalculator,
  'hijri-date-today': HijriDateToday,
  'salah-times-calculator': SalahTimesCalculator,
  'hijri-gregorian-converter': HijriGregorianConverter,
  'sehri-iftar-schedule-calculator': SehriIftarScheduleCalculator,
  'faraiz-inheritance-calculator': FaraizCalculator,
  // Gold & Silver
  'live-gold-rates': LiveGoldRatesTool,
  'live-gold-rates-tool': LiveGoldRatesTool,
  'gold-price-calculator': GoldPriceCalculator,
  'silver-price-calculator': SilverPriceCalculator,
  'gold-purity-calculator': GoldPurityCalculator,
  'karat-adjustment-calculator': KaratAdjustmentCalculator,
  'gold-weight-arithmetic-calculator': GoldWeightArithmeticCalculator,
  'gold-silver-unit-converter': GoldSilverUnitConverter,
  'gold-rate-finder': GoldRateFinder,
  // Construction
  'plot-area-calculator': PlotAreaCalculator,
  'tile-calculator': TileCalculator,
  'paint-calculator': PaintCalculator,
  'brick-calculator': BrickCalculator,
  'square-footage-calculator': SquareFootageCalculator,
  'concrete-calculator': ConcreteCalculator,
  'wallpaper-calculator': WallpaperCalculator,
  'flooring-calculator': FlooringCalculator,
  'solar-panel-calculator': SolarPanelCalculator,
  'roofing-calculator': RoofingCalculator,
  'stair-calculator': StairCalculator,
  'fence-calculator': FenceCalculator,
  'lumber-board-feet-calculator': LumberBoardFeetCalculator,
  'drywall-calculator': DrywallCalculator,
  'gravel-sand-calculator': GravelSandCalculator,
  'hvac-btu-calculator': HvacBtuCalculator,
  'room-area-calculator': RoomAreaCalculator,
  // Utility
  'password-generator': PasswordGenerator,
  'base64-converter': Base64Converter,
  'word-counter': WordCounter,
  'case-converter': CaseConverter,
  'text-reverser': TextReverser,
  'hash-calculator': HashCalculator,
  'uuid-generator': UuidGenerator,
  'unix-timestamp-converter': UnixTimestampConverter,
  'lorem-ipsum-generator': LoremIpsumGenerator,
  'json-csv-converter': JsonCsvConverter,
  'json-yaml-converter': JsonYamlConverter,
  'markdown-converter': MarkdownConverter,
  'color-converter': ColorConverter,
  'url-encoder-converter': UrlEncoderConverter,
  'regex-tester': RegexTester,
  'iban-validator': IbanValidator,
  // Fun
  'zodiac-calculator': ZodiacCalculator,
  'zodiac-sign-calculator': ZodiacCalculator,
  'chinese-zodiac-calculator': ChineseZodiacCalculator,
  'magic-eight-ball': MagicEightBall,
  'magic-8-ball': MagicEightBall,
  'coin-dice-roller': CoinDiceRoller,
  'coin-flip-dice-roller': CoinDiceRoller,
  'numerology-calculator': NumerologyCalculator,
  'decision-wheel': DecisionWheel,
  'birthday-paradox-calculator': BirthdayParadoxCalculator,
  'age-on-planets-calculator': AgeOnPlanetsCalculator,
  'cat-age-calculator': CatAgeCalculator,
  'dog-age-calculator': DogAgeCalculator,
  // Unit-extras (custom, not generic UnitConverter)
  'angle-converter': AngleConverter,
  'wind-speed-converter': WindSpeedConverter,
  'cooking-measurement-converter': CookingMeasurementConverter,
  // Health-extras
  'heat-index-calculator': HeatIndexCalculator,
  'one-rep-max-calculator': OneRepMaxCalculator,
  'pregnancy-weight-gain-calculator': PregnancyWeightGainCalculator,
  'vo2-max-calculator': Vo2MaxCalculator,
  // Date-extras
  'days-until-calculator': DaysUntilCalculator,
  // Islamic-extras
  'qibla-direction-finder': QiblaDirectionFinder,
  // Math-extras
  'solid-volume-calculator': SolidVolumeCalculator,
  // Utility-extras
  'qr-code-generator': QrCodeGenerator,
  'barcode-generator': BarcodeGenerator,
  'image-format-converter': ImageFormatConverter,
  'url-encoder': UrlEncoderConverter,
  // Education
  'student-result-card': StudentResultCard,
  // Gold/Silver alias
  'gold-silver-rate-finder': GoldRateFinder,
};

export function getCalculator(slug: string): CalcRegistryEntry {
  const direct = directRegistry[slug];
  if (direct) return direct;
  if (UNIT_CONFIGS[slug]) {
    return UnitConverter;
  }
  return NotFound;
}

export function isImplemented(slug: string): boolean {
  return Boolean(directRegistry[slug] || UNIT_CONFIGS[slug]);
}
