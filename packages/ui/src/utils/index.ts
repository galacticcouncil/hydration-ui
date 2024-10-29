import { SerializedStyles, Theme } from "@emotion/react"

export function createVariants<T extends Record<string, SerializedStyles>>(
  callback: (theme: Theme) => T,
) {
  return (key: keyof T) =>
    ({ theme }: { theme: Theme }) =>
      callback(theme)[key]
}
