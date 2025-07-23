import { wrap } from "comlink"

import type { worker as workerApi } from "./ping.worker"
import PingWorker from "./ping.worker?worker"

export const pingWorker = wrap<typeof workerApi>(new PingWorker())
