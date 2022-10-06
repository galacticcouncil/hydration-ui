import { Text } from "components/Typography/Text/Text"
import { css } from "@emotion/react"
import { theme } from "theme"
import { ReactNode } from "react"
import { STag } from "./Tag.styled"
import { BoxProps } from "components/Box/Box"

export const Tag = ({
  children,
  ...props
}: { children?: ReactNode } & BoxProps) => {
  return (
    <STag {...props}>
      <Text
        fs={9}
        fw={800}
        css={css`
          color: ${theme.colors.black};
          text-transform: uppercase;
          display: inline-block;
        `}
      >
        {children}
      </Text>
    </STag>
  )
}
