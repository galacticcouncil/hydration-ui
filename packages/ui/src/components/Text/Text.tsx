import styled from "@emotion/styled"

import { ThemeProps } from "@/theme"

export type TextProps = {
  font?: keyof ThemeProps["fontFamilies1"]
  fs?: number
  fw?: 400 | 500 | 600
}

export const Text = styled.p<TextProps>`
  font-family: ${({ theme, font = "Secondary" }) => theme.fontFamilies1[font]};
  font-weight: ${({ fw = 400 }) => fw};
  font-size: ${({ fs }) => (fs ? `${fs}px` : "inherit")};
`
