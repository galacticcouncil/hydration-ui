import { readdir, readFile } from "node:fs/promises"

export class BrowserPool {
  constructor(
    launch,
    {
      timeoutMs = 240000,
      limit = 3,
      closeTimeoutMs = 10000,
      fatal = () => process.exit(1),
    } = {},
  ) {
    this.launch = launch
    this.timeoutMs = timeoutMs
    this.limit = limit
    this.closeTimeoutMs = closeTimeoutMs
    this.fatal = fatal
    this.leases = new Set()
    this.stopping = false
    this.browser = null
  }

  async acquire() {
    if (this.stopping) throw new Error("Browser pool is stopping")
    if (this.leases.size >= this.limit) throw new Error("Browser pool is full")
    const contexts = new Set()
    let released = false
    const lease = {
      newContext: async (options) => {
        const browser = await this.getBrowser()
        const context = await browser.newContext(options)
        contexts.add(context)
        if (released || this.stopping) {
          await this.closeContext(context)
          throw new Error("Browser lease is closed")
        }
        const timer = setTimeout(() => {
          this.closeContext(context).catch(() =>
            this.close().catch(() => this.fatal()),
          )
        }, this.timeoutMs)
        timer.unref()
        context.once("close", () => {
          clearTimeout(timer)
          contexts.delete(context)
        })
        return context
      },
      close: async () => {
        released = true
        try {
          await Promise.all(
            [...contexts].map((context) => this.closeContext(context)),
          )
        } finally {
          this.leases.delete(lease)
        }
      },
    }
    this.leases.add(lease)
    return lease
  }

  async getBrowser() {
    if (this.stopping) throw new Error("Browser pool is stopping")
    if (!this.browser) {
      const pending = Promise.resolve().then(() => this.launch())
      this.browser = pending
      pending.then(
        (browser) => {
          browser.once("disconnected", () => {
            if (this.browser === pending) this.browser = null
          })
        },
        () => {
          if (this.browser === pending) this.browser = null
        },
      )
    }
    return this.browser
  }

  async closeContext(context) {
    const timer = setTimeout(() => this.fatal(), this.closeTimeoutMs)
    timer.unref()
    try {
      await context.close()
    } finally {
      clearTimeout(timer)
    }
  }

  async close() {
    this.stopping = true
    const browser = await this.browser
    if (browser) await browser.close()
    this.leases.clear()
  }
}

export async function processCounts(root = "/proc") {
  const counts = { processes: 0, zombies: 0, chrome: 0, chromeCrashpad: 0 }
  for (const pid of await readdir(root)) {
    if (!/^\d+$/.test(pid)) continue
    let stat
    try {
      stat = await readFile(`${root}/${pid}/stat`, "utf8")
    } catch {
      continue
    }
    const end = stat.lastIndexOf(")")
    const name = stat.slice(stat.indexOf("(") + 1, end)
    counts.processes++
    if (stat.slice(end + 2).startsWith("Z ")) counts.zombies++
    if (name === "chrome") counts.chrome++
    if (name === "chrome_crashpad") counts.chromeCrashpad++
  }
  return counts
}
