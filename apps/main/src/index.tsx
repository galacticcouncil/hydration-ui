import { patchBigJs } from "@galacticcouncil/utils"
import Big from "big.js"
import { enableMapSet } from "immer"
import { createRoot } from "react-dom/client"

import { setupLocalSolanaRpcProxy } from "@/utils/solanaRpcProxy"

import { App } from "./App"

enableMapSet()
patchBigJs()
Big.PE = 666
setupLocalSolanaRpcProxy()

createRoot(document.getElementById("root")!).render(<App />)
