import { doNothing } from "remeda"

const trace = console.trace.bind(console)
const debug = console.debug.bind(console)
const log = console.log.bind(console)
const info = console.info.bind(console)
const warn = console.warn.bind(console)
const error = console.error.bind(console)
const table = console.table.bind(console)

const isDev = process.env.NODE_ENV === "development"

export const logger = {
  trace: isDev ? trace : doNothing,
  debug: isDev ? debug : doNothing,
  log: isDev ? log : doNothing,
  table: isDev ? table : doNothing,
  info,
  warn,
  error,
}
