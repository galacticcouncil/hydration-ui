import styled from "@emotion/styled"

import { ThemeProps } from "@/theme"

export type STextProps = {
  font?: keyof ThemeProps["fontFamilies1"]
}

export const SText = styled.p<STextProps>`
  font-family: ${({ theme, font = "Secondary" }) => theme.fontFamilies1[font]};
`
