import { theme } from "theme"
import { ButtonTransparent } from "components/Button/Button"
import { ReactComponent as ChevronRightIcon } from "assets/icons/ChevronRight.svg"

export const WalletAssetsHydraPositionsActions = () => {
  return (
    <div sx={{ display: ["block", "none"] }}>
      <div sx={{ display: ["block", "none"] }}>
        <ButtonTransparent css={{ color: theme.colors.iconGray }}>
          <ChevronRightIcon />
        </ButtonTransparent>
      </div>
    </div>
  )
}
