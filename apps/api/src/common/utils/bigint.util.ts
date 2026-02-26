import { BadRequestException } from '@nestjs/common';

const POSITIVE_BIGINT_RE = /^\d+$/;

export function parseBigIntId(v: unknown, field = 'id'): bigint {
  const s = String(v ?? '').trim();
  if (!s || !POSITIVE_BIGINT_RE.test(s) || s === '0') {
    throw new BadRequestException(`INVALID_${field.toUpperCase()}`);
  }

  try {
    const n = BigInt(s);
    if (n <= 0n) throw new Error('non-positive');
    return n;
  } catch {
    throw new BadRequestException(`INVALID_${field.toUpperCase()}`);
  }
}

export function bigintToString(v: bigint | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  return v.toString();
}
