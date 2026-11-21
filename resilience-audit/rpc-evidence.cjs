function request(entry, payload) {
  try {
    const message = JSON.parse(String(payload))
    if (!entry.pendingStateCalls) {
      Object.defineProperty(entry, "pendingStateCalls", { value: new Set() })
      Object.defineProperty(entry, "pendingChainHeadCalls", {
        value: new Set(),
      })
      Object.defineProperty(entry, "pendingOperations", { value: new Set() })
    }
    if (message.method === "state_call" && message.id !== undefined) {
      entry.pendingStateCalls.add(String(message.id))
    }
    if (message.method === "chainHead_v1_call" && message.id !== undefined) {
      entry.pendingChainHeadCalls.add(String(message.id))
    }
  } catch {}
}

function response(entry, payload) {
  try {
    const message = JSON.parse(String(payload))
    if (message.error)
      entry.rpcErrorResponses = (entry.rpcErrorResponses || 0) + 1
    if (
      entry.pendingStateCalls?.delete(String(message.id)) &&
      Object.hasOwn(message, "result") &&
      !message.error &&
      typeof message.result === "string" &&
      /^0x[0-9a-f]*$/i.test(message.result)
    ) {
      entry.successfulStateCalls = (entry.successfulStateCalls || 0) + 1
    }
    if (
      entry.pendingChainHeadCalls?.delete(String(message.id)) &&
      message.result?.result === "started" &&
      message.result.operationId
    ) {
      entry.pendingOperations.add(message.result.operationId)
    }
    const event = message.params?.result
    if (
      event?.event === "operationCallDone" &&
      entry.pendingOperations?.delete(event.operationId) &&
      typeof event.output === "string" &&
      /^0x[0-9a-f]*$/i.test(event.output)
    ) {
      entry.successfulChainHeadCalls = (entry.successfulChainHeadCalls || 0) + 1
    }
  } catch {}
}

module.exports = { request, response }
