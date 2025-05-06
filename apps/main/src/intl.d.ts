declare namespace Intl {
  interface NumberFormat {
    formatToParts(number?: number | bigint | string): NumberFormatPart[]
  }
}
