import { jsx as emotionJsx } from "@emotion/react"
import { parseSxProps } from "./jsx-sx-convert"

export function jsx(...args: Parameters<typeof emotionJsx>) {
  args[1] = parseSxProps(args[1])
  return emotionJsx(...args)
}

export const createElement: unknown = jsx
