import type { SettingsItems } from '../interfaces/interfaces';

// Returns divisor to get net from gross. Defaults to 1.27 if settings not provided.
export function getVatDivisor(settings?: SettingsItems): number {
  const percent = Number(settings?.vatPercent);
  if (!Number.isFinite(percent) || percent <= 0) {
    return 1.27; // default 27%
  }
  return 1 + percent / 100;
}
