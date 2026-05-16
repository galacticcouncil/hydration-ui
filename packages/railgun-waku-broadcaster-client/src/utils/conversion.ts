// Vendored from upstream `packages/common/src/utils/conversion.ts`. The
// browser polyfill for `buffer` (nodePolyfills() in vite.config.ts) makes the
// Buffer global available, so these wrappers don't need source-level changes.
export const hexToUTF8String = (hexData: string): string => {
  const buffer = Buffer.from(hexData, "hex")
  return new TextDecoder().decode(buffer)
}

export const bytesToUtf8 = (bytes: Uint8Array): string => {
  return Buffer.from(bytes).toString("utf8")
}

export const bytesToHex = (bytes: Uint8Array): string => {
  return Buffer.from(bytes).toString("hex")
}

export const utf8ToBytes = (utf8: string): Uint8Array => {
  return Buffer.from(utf8, "utf8")
}
