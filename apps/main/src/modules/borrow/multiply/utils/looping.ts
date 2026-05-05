export function validateLoopingEvmTx(
  tx: { from?: string; to?: string; data?: string },
  label: string,
): asserts tx is { from: string; to: string; data: string } {
  if (!tx.from || !tx.to || !tx.data) {
    throw new Error(`Invalid ${label} transaction`)
  }
}
