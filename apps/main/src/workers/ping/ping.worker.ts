import { expose } from "comlink"

export const worker = {
  getPing: async (url: string): Promise<number | null> => {
    const start = performance.now()
    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: "2.0",
          method: "chain_getBlock",
          params: [],
        }),
      })

      const end = performance.now()
      return end - start
    } catch (e) {
      return null
    }
  },
}

expose(worker)
