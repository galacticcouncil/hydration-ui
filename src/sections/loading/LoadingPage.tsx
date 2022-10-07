import { Spinner } from "components/Spinner/Spinner.styled"
import { ReactComponent as BasiliskIcon } from "assets/icons/BasiliskIcon.svg"
import { ReactComponent as BasiliskLogo } from "assets/icons/BasiliskLogo.svg"
import { css } from "@emotion/react"

export const LoadingPage = () => {
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: 32px;

        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100vh;
      `}
    >
      <div sx={{ flex: "row", gap: 16, align: "center" }}>
        <BasiliskIcon width={72} height={72} />
        <BasiliskLogo width={148} height={44} />
      </div>
      <Spinner width={32} height={32} />
    </div>
  )
}
