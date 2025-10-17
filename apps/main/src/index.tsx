import Big from "big.js"
import { enableMapSet } from "immer"
import { createRoot } from "react-dom/client"

import { App } from "./App"

enableMapSet()
Big.PE = 666

createRoot(document.getElementById("root")!).render(<App />)
