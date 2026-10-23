// Lightweight signature check, not a decoder or a malware scanner.
export function looksLikeMp3(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return true;
  for (let i = 0; i < bytes.length - 3; i++) {
    const a = bytes[i], b = bytes[i + 1], c = bytes[i + 2];
    if (
      a === 0xff && (b & 0xe0) === 0xe0 && (b & 0x18) !== 0x08 && (b & 0x06) !== 0 &&
      (c & 0xf0) !== 0 && (c & 0xf0) !== 0xf0 && (c & 0x0c) !== 0x0c
    ) return true;
  }
  return false;
}
