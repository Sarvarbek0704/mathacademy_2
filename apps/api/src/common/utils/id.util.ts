export { parseBigIntId } from './bigint.util';

export function toStrId(v: bigint | null | undefined): string | null {
  if (v === null || v === undefined) return null;
  return v.toString();
}
