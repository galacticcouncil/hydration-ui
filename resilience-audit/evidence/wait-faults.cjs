/* Audit-only tests of exact installed p-wait-for timeout semantics. */
const fs = require('node:fs')
const path = require('node:path')
const assert = require('node:assert/strict')

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const observe = async (promise, ms) => Promise.race([
  promise.then((value) => ({ status: 'fulfilled', value }),
    (error) => ({ status: 'rejected', name: error.name, message: error.message })),
  delay(ms).then(() => ({ status: 'pending_at_observation' })),
])

;(async () => {
  const { default: waitFor } = await import('p-wait-for')
  const cases = []
  const hanging = await observe(waitFor(() => new Promise(() => {}), {
    interval: 5, timeout: 20,
  }), 120)
  assert.equal(hanging.status, 'pending_at_observation')
  cases.push({ id: 'hanging_condition_outlives_timeout', configuredTimeoutMs: 20,
    observationMs: 120, ...hanging })

  const late = await observe(waitFor(async () => {
    await delay(70)
    return waitFor.resolveWith('late RPC success')
  }, { interval: 5, timeout: 20 }), 120)
  assert.equal(late.status, 'fulfilled')
  assert.equal(late.value, 'late RPC success')
  cases.push({ id: 'late_success_accepted_after_timeout', configuredTimeoutMs: 20,
    conditionDelayMs: 70, observationMs: 120, ...late })

  const normal = await observe(waitFor(() => false, { interval: 5, timeout: 20 }), 120)
  assert.equal(normal.status, 'rejected')
  assert.equal(normal.name, 'TimeoutError')
  cases.push({ id: 'settled_false_condition_timeout_works', configuredTimeoutMs: 20,
    observationMs: 120, ...normal })

  const results = {
    checkout: '19f54bf5bde252a407e23e7ce3e4a8f6e3992182',
    package: 'p-wait-for', version: '6.0.0',
    scope: 'Exact installed library exercised; consumer RPCs are not executed. Pending observations are bounded; source directly awaits condition without racing its promise against timeout.',
    cases,
  }
  fs.writeFileSync(path.join(__dirname, 'wait-faults.results.json'), JSON.stringify(results, null, 2) + '\n')
  process.stdout.write(JSON.stringify({ cases: cases.length, assertions: 'passed' }) + '\n')
})().catch((error) => { process.stderr.write(error.stack + '\n'); process.exitCode = 1 })
