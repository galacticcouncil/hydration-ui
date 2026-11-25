// Every market intent is offered only against opposite intents for this many
// blocks after inclusion, then fills like a plain swap; Order Match extends it
export const MATCH_WINDOW_BLOCKS = 3
export const ORDER_MATCH_WINDOW_BLOCKS = 30

export const getMatchWindowMs = (isOrderMatch: boolean, blockTimeMs: number) =>
  (isOrderMatch ? ORDER_MATCH_WINDOW_BLOCKS : MATCH_WINDOW_BLOCKS) * blockTimeMs
