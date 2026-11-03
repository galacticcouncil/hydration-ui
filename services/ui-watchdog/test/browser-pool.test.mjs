import test from "node:test"
import assert from "node:assert/strict"
import { EventEmitter } from "node:events"
import { BrowserPool, processCounts } from "../src/browser-pool.mjs"

function fixture(options) {
  let launches = 0
  const browser = new EventEmitter()
  browser.newContext = async () => {
    const context = new EventEmitter()
    context.closed = false
    context.close = async () => {
      context.closed = true
      context.emit("close")
    }
    return context
  }
  browser.close = async () => browser.emit("disconnected")
  return {
    browser,
    pool: new BrowserPool(async () => {
      launches++
      return browser
    }, options),
    launches: () => launches,
  }
}

test("concurrent leases share one launch and close only their own contexts", async () => {
  const f = fixture()
  const leases = await Promise.all([
    f.pool.acquire(),
    f.pool.acquire(),
    f.pool.acquire(),
  ])
  await assert.rejects(f.pool.acquire(), /full/)
  const contexts = await Promise.all(leases.map((l) => l.newContext()))
  assert.equal(f.launches(), 1)
  await leases[0].close()
  assert.equal(contexts[0].closed, true)
  assert.equal(contexts[1].closed, false)
  await Promise.all(leases.slice(1).map((l) => l.close()))
  const next = await f.pool.acquire()
  await next.newContext()
  assert.equal(f.launches(), 1)
  await next.close()
  await f.pool.close()
  await assert.rejects(f.pool.acquire(), /stopping/)
})

test("a hung operation loses its context at the hard deadline", async () => {
  const f = fixture({ timeoutMs: 10 })
  const lease = await f.pool.acquire()
  const context = await lease.newContext()
  await new Promise((resolve) => setTimeout(resolve, 30))
  assert.equal(context.closed, true)
  await lease.close()
  await f.pool.close()
})

test("launch failures can be retried and crashes replace the browser", async () => {
  const f = fixture()
  let fail = true
  f.pool.launch = async () => {
    if (fail) {
      fail = false
      throw new Error("launch failed")
    }
    return f.browser
  }
  const lease = await f.pool.acquire()
  await assert.rejects(lease.newContext(), /launch failed/)
  await lease.newContext()
  f.browser.emit("disconnected")
  assert.equal(f.pool.browser, null)
  await lease.newContext()
  await lease.close()
  await f.pool.close()
})

test("process observation reads the current PID namespace", async () => {
  const counts = await processCounts()
  assert.ok(counts.processes > 0)
  assert.ok(counts.zombies >= 0)
})
