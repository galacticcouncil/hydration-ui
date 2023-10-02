import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"
import FillIcon from "assets/icons/Fill.svg?react"
import PauseIcon from "assets/icons/PauseIcon.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { TableAction } from "components/Table/Table"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { useAccountStore } from "state/store"
import { safeConvertAddressSS58 } from "utils/formatting"
import { OrderTableData } from "sections/trade/sections/otc/orders/OtcOrdersData.utils"

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
            disabled={!account}
            variant={"error"}
            children={
              <span sx={{ width: "90px", textAlign: "center" }}>
                {t("otc.offers.table.actions.cancel")}
              </span>
            }
          />
        )}
        {orderOwner !== userAddress && (
          <TableAction
            icon={<FillIcon sx={{ mr: 4 }} />}
            onClick={() => props.onFill(props.data)}
            disabled={!account}
            children={
              <span sx={{ width: "90px" }}>
                {t("otc.offers.table.actions.fill")}
              </span>
            }
          />
        )}
      </div>
    </>
  )
}
