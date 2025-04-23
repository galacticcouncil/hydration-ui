import {
  // @ts-expect-error
  jsx as emotionJsx,
  // @ts-expect-error
  jsxs as emotionJsxs,
} from "@emotion/react/jsx-runtime"
import { parseSxProps } from "./jsx-sx-convert"

export { Fragment } from "react"

export function jsx(...args: Parameters<typeof emotionJsx>) {
  args[1] = parseSxProps(args[1])
  return emotionJsx(...args)
}

export function jsxs(...args: Parameters<typeof emotionJsxs>) {
  args[1] = parseSxProps(args[1])
  return emotionJsxs(...args)
}
