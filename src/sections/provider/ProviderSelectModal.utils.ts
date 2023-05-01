import { WsProvider } from "@polkadot/rpc-provider"

export const connectWsProvider = (url: string) => {
  return new Promise<WsProvider>(function (resolve, reject) {
    const provider = new WsProvider(`wss://${url}`)

    provider.on("connected", () => {
      resolve(provider)
    })
    provider.on("error", () => {
      provider.disconnect()
      reject("disconnected")
    })
  })
}
