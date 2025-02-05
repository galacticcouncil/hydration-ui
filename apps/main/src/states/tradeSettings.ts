import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type TSettingsKeys = "slippage" | "slippageTwap" | "maxRetries"

type TTradeSettings = {
  slippage: string
  slippageTwap: string
  maxRetries: number
  setValue: (id: TSettingsKeys, value: string) => void
}

const version = 0.1

const defaultState = {
  slippage: "0.5",
  slippageTwap: "0.5",
  maxRetries: 5,
}

export const useTradeSettings = create<TTradeSettings>()(
  persist(
    (set) => ({
      ...defaultState,
      setValue: (id, value) => set({ [id]: value }),
    }),
    {
      name: "trade.settings",
      version,
      storage: createJSONStorage(() => ({
        getItem: async (name: string) => {
          const data = window.localStorage.getItem(name)

          if (data) {
            const parsedData = JSON.parse(data)

            if (parsedData.state) {
              return JSON.stringify({
                ...parsedData,
              })
            }

            return JSON.stringify({
              version,
              state: {
                ...parsedData,
              },
            })
          }

          return JSON.stringify({
            version,
            state: {
              ...defaultState,
            },
          })
        },
        setItem(name, value) {
          const parsedState = JSON.parse(value)

          const stringState = JSON.stringify({
            version,
            state: parsedState?.state ? { ...parsedState.state } : parsedState,
          })

          window.localStorage.setItem(name, stringState)
        },
        removeItem(name) {
          window.localStorage.removeItem(name)
        },
      })),
    },
  ),
)
