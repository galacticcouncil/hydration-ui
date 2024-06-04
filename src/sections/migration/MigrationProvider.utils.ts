import { Buffer } from "buffer"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const MIGRATION_LS_KEYS = [
  "external-tokens",
  "address-book",
  "toasts",
  "rpcUrl",
  "hydradx-rpc-list",
  "referral-codes",
  "dca.settings",
  "trade.settings",
]
export const MIGRATION_QUERY_PARAM = "migration"
export const MIGRATION_TRIGGER_DOMAIN = import.meta.env
  .VITE_MIGRATION_TRIGGER_DOMAIN as string

export const MIGRATION_TARGET_DOMAIN = import.meta.env
  .VITE_MIGRATION_TARGET_DOMAIN

export const serializeLocalStorage = (keys: string[]): string => {
  const data: { [key: string]: any } = {}

  keys.forEach((key) => {
    const value = localStorage.getItem(key)
    if (value) {
      data[key] = JSON.parse(value)
    }
  })

  const json = JSON.stringify(data)
  return Buffer.from(json, "binary").toString("base64")
}

export const importToLocalStorage = (data: string) => {
  const json = Buffer.from(data, "base64").toString("utf-8")
  const ls = JSON.parse(json)

  const keys = Object.keys(ls)

  keys.forEach((key) => {
    const value = ls[key]
    localStorage.setItem(key, JSON.stringify(value))
  })
}

type MigrationStore = {
  migrationCompleted: string
  setMigrationCompleted: (date: string) => void
}

export const useMigrationStore = create<MigrationStore>()(
  persist(
    (set) => ({
      migrationCompleted: "",
      setMigrationCompleted: (date: string) => {
        set({ migrationCompleted: date })
      },
    }),
    {
      name: "hdx-migration",
      version: 0,
    },
  ),
)
