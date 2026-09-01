export function parseExpiresIn(value: string): number {
  const match = /^(\d+)([smhdw])?$/.exec(value.trim());
  if (!match) return 0;

  const amount = Number(match[1]);
  const unit = match[2] ?? "s";

  const multipliers = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800,
  } as const;

  return amount * multipliers[unit as keyof typeof multipliers];
}
