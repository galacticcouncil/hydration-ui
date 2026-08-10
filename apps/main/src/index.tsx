import { patchBigJs } from "@galacticcouncil/utils"
import { register as registerNttLayouts } from "@wormhole-foundation/sdk-definitions-ntt"
import Big from "big.js"
import { enableMapSet } from "immer"
import { createRoot } from "react-dom/client"

import { App } from "./App"

enableMapSet()
patchBigJs()
// sdk-definitions-ntt@7 turned layout registration from an import side effect
// into an explicit call, but xc-sdk still relies on the bare import — leaving
// `Ntt:WormholeTransfer` unregistered and every vaa deserialization throwing.
// Idempotent, so this can go once the sdk calls register() itself.
registerNttLayouts()
Big.PE = 666

createRoot(document.getElementById("root")!).render(<App />)
