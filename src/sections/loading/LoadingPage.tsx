import { Spinner } from "components/Spinner/Spinner.styled"
import { ReactComponent as HydraLogo } from "assets/icons/HydraLogo.svg"
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
        <HydraLogo width={50} height={50} />
      </div>
      <Spinner width={32} height={32} />
    </div>
  )
}
