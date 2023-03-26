import { ReactComponent as ChevronRightIcon } from "assets/icons/ChevronRight.svg"
import { ReactComponent as FillIcon } from "assets/icons/Fill.svg"
import { ReactComponent as PauseIcon } from "assets/icons/PauseIcon.svg"
import { ButtonTransparent } from "components/Button/Button"
import { TableAction } from "components/Table/Table"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { useAccountStore } from "state/store"
import { safeConvertAddressSS58 } from "utils/formatting"
import { OrderTableData } from "../OtcOrdersData.utils"

type Props = {
  data: OrderTableData
  onFill: (data: OrderTableData) => void
  onClose: (data: OrderTableData) => void
}

export const OtcOrderActions = (props: Props) => {
  const { t } = useTranslation()
  const { account } = useAccountStore()

  const userAddress = safeConvertAddressSS58(account?.address, 63)
  const orderOwner = props.data.owner
  return (
    <>
      <div sx={{ display: ["block", "none"] }}>
        <ButtonTransparent css={{ color: theme.colors.iconGray }}>
          <ChevronRightIcon />
        </ButtonTransparent>
      </div>
      <div
        sx={{
          flex: "row",
          gap: 10,
          display: ["none", "flex"],
          align: "center",
          mr: 24,
        }}
      >
        {orderOwner === userAddress && (
          <TableAction
            icon={<PauseIcon />}
            onClick={() => props.onClose(props.data)}
            disabled={false}
            variant={"error"}
          >
            {t("otc.offers.table.actions.close")}
          </TableAction>
        )}
        {orderOwner !== userAddress && (
          <TableAction
            icon={<FillIcon sx={{ mr: 4 }} />}
            onClick={() => {
              console.log("fiil-clicked")
              props.onFill(props.data)
            }}
            disabled={false}
          >
            {t("otc.offers.table.actions.fill")}
          </TableAction>
        )}
      </div>
    </>
  )
}
