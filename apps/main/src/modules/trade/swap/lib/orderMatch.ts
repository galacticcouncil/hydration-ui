import { minutesToMilliseconds } from "date-fns"

// An Order Match intent is offered only against opposite intents for this
// long after inclusion, then fills like a plain swap
export const ORDER_MATCH_WINDOW_MS = minutesToMilliseconds(5)
