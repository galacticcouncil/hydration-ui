import { Buffer } from "buffer"

export const MIGRATION_CHECK_KEY = "__migration-completed"
export const MIGRATION_QUERY_PARAM = "migration"
export const MIGRATION_TARGET_URL = "http://localhost:3001"
export const MIGRATION_TRIGGER_URLS = [
  "http://localhost:5173",
  "https://app.hydradx.io",
]

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
  const json = Buffer.from(data, "base64").toString("binary")
  const ls = JSON.parse(json)

  const keys = Object.keys(ls)

  keys.forEach((key) => {
    const value = ls[key]
    localStorage.setItem(key, JSON.stringify(value))
  })
}
