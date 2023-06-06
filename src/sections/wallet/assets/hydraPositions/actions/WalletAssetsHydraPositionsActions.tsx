import { theme } from "theme"
import { ReactComponent as ChevronDownIcon } from "assets/icons/ChevronDown.svg"
import { ButtonTransparent } from "components/Button/Button"
import { ReactComponent as ChevronRightIcon } from "assets/icons/ChevronRight.svg"

type Props = {
  toggleExpanded: () => void
  onTransferClick: () => void
  isExpanded: boolean
}

export const WalletAssetsHydraPositionsActions = (props: Props) => {
  return (
    <>
      <div sx={{ display: ["block", "none"] }}>
        <div sx={{ display: ["block", "none"] }}>
          <ButtonTransparent css={{ color: theme.colors.iconGray }}>
            <ChevronRightIcon />
          </ButtonTransparent>
        </div>
      </div>
      <div sx={{ flex: "row", gap: 10, display: ["none", "flex"] }}>
        <ButtonTransparent
          onClick={props.toggleExpanded}
          css={{
            color: theme.colors.iconGray,
            opacity: props.isExpanded ? "1" : "0.5",
            transform: props.isExpanded ? "rotate(180deg)" : undefined,
          }}
        >
          <ChevronDownIcon />
        </ButtonTransparent>
      </div>
    </>
  )
}
