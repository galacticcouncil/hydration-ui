// @ts-expect-error
import { jsxDEV as emotionJsxDEV } from "@emotion/react/jsx-dev-runtime"
import { parseSxProps } from "./jsx-sx-convert"

export { Fragment } from "react"

export function jsxDEV(...args: Parameters<typeof emotionJsxDEV>) {
  args[1] = parseSxProps(args[1])
  return emotionJsxDEV(...args)
}
