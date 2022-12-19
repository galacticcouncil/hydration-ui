import { theme } from "theme"
import { ReactComponent as ChevronDownIcon } from "assets/icons/ChevronDown.svg"
import { ButtonTransparent } from "components/Button/Button"
import { ReactComponent as ChevronRightIcon } from "assets/icons/ChevronRight.svg"
//import { ReactComponent as TransferIcon } from "assets/icons/TransferIcon.svg"
// import { ReactComponent as DetailsIcon } from "assets/icons/DetailsIcon.svg"
//import { TableAction } from "components/Table/Table"
//import { useTranslation } from "react-i18next"

type Props = {
  toggleExpanded: () => void
  onTransferClick: () => void
}

export const WalletAssetsHydraPositionsActions = (props: Props) => {
  //const { t } = useTranslation()

  return (
    <>
      <div sx={{ display: ["block", "none"] }}>
        <div sx={{ display: ["block", "none"] }}>
          <ButtonTransparent
            onClick={() => console.log("detail")}
            css={{ color: theme.colors.iconGray }}
          >
            <ChevronRightIcon />
          </ButtonTransparent>
        </div>
      </div>
      <div sx={{ flex: "row", gap: 10, display: ["none", "flex"] }}>
        {/*<TableAction icon={<TransferIcon />} onClick={props.onTransferClick}>*/}
        {/*  {t("wallet.assets.hydraPositions.actions.transfer")}*/}
        {/*</TableAction>*/}
        {/*<TableAction*/}
        {/*  icon={<DetailsIcon />}*/}
        {/*  onClick={() => console.log("details")}*/}
        {/*>*/}
        {/*  {t("wallet.assets.hydraPositions.actions.details")}*/}
        {/*</TableAction>*/}
        <ButtonTransparent
          onClick={props.toggleExpanded}
          css={{ color: theme.colors.iconGray }}
        >
          <ChevronDownIcon />
        </ButtonTransparent>
      </div>
    </>
  )
}
