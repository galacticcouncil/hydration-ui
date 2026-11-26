import test from "node:test"
import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { BrowserPool, processCounts } from "../src/browser-pool.mjs"
import { launchChrome } from "../src/chrome.mjs"

test(
  "repeated checks reuse Chromium and leave no zombies under tini",
  { timeout: 60000 },
  async (t) => {
    // /proc is namespace-wide. In CI's container PID 1 doesn't reap, so
    // earlier Chrome launches leave zombies and crashpads; count only this test's.
    const before = await processCounts()
    let launches = 0
    const pool = new BrowserPool(async () => {
      launches++
      return launchChrome({ chromiumSandbox: false })
    })
    try {
      for (let i = 0; i < 20; i++) {
        const lease = await pool.acquire()
        try {
          const context = await lease.newContext()
          const page = await context.newPage()
          await page.setContent("<p>observer lifecycle regression</p>")
          assert.equal(
            await page.textContent("p"),
            "observer lifecycle regression",
          )
        } finally {
          await lease.close()
        }
      }
      assert.equal(launches, 1)
      const counts = await processCounts()
      assert.ok(
        counts.chrome - before.chrome < 10,
        JSON.stringify({ before, counts }),
      )
    } finally {
      await pool.close()
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
    const counts = await processCounts()
    if ((await readFile("/proc/1/comm", "utf8")).trim() !== "tini") {
      t.diagnostic(
        "run this test in the watchdog image to verify PID 1 reaping",
      )
      return
    }
    assert.equal(counts.zombies, 0, JSON.stringify(counts))
    assert.equal(counts.chrome, 0, JSON.stringify(counts))
    assert.equal(counts.chromeCrashpad, 0, JSON.stringify(counts))
  },
)
