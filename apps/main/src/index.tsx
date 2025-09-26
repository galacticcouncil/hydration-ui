import { enableMapSet } from "immer"
import { createRoot } from "react-dom/client"

import { App } from "./App"

enableMapSet()

createRoot(document.getElementById("root")!).render(<App />)
