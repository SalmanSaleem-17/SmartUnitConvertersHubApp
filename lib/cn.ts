// Lightweight class name composer — concatenates truthy class strings,
// last-wins is *not* enforced; rely on Tailwind specificity rules.
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
