import PingWorker from "./ping.worker?worker"
import type { worker as workerApi } from "./ping.worker"
import { wrap } from "comlink"

export const pingWorker = wrap<typeof workerApi>(new PingWorker())
