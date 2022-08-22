import { Spinner } from "components/Spinner/Spinner.styled"
import { Box } from "components/Box/Box"
import { ReactComponent as BasiliskIcon } from "assets/icons/BasiliskIcon.svg"
import { ReactComponent as BasiliskLogo } from "assets/icons/BasiliskLogo.svg"
import { css } from "styled-components"

export function LoadingPage() {
  return (
    <Box
      flex
      column
      gap={32}
      css={css`
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100vh;
      `}
    >
      <Box flex gap={16} align="center">
        <BasiliskIcon width={72} height={72} />
        <BasiliskLogo width={148} height={44} />
      </Box>
      <Spinner width={32} height={32} />
    </Box>
  )
}
