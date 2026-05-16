// Vendored from upstream `packages/common/src/utils/broadcaster-debug.ts`.
//
// One change vs. upstream: dropped the `process.env.NODE_ENV === 'test'`
// re-throw, because we don't ship the upstream Mocha test rig and `process`
// isn't reliably defined under Vite's browser bundle (only `process.env.*` is
// polyfilled at compile-time by vite-plugin-node-polyfills).
import { BroadcasterDebugger } from "../models/export-models.js"

export class BroadcasterDebug {
  private static debug: Optional<BroadcasterDebugger>

  static setDebugger(debug: BroadcasterDebugger) {
    this.debug = debug
  }

  static log(msg: string) {
    if (this.debug) {
      this.debug.log(msg)
    }
  }

  static error(err: Error) {
    if (this.debug) {
      this.debug.error(err)
    }
  }
}
