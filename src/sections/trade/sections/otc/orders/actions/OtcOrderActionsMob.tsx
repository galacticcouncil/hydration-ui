import FillIcon from "assets/icons/Fill.svg?react"
import PauseIcon from "assets/icons/PauseIcon.svg?react"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { OrderCapacity } from "sections/trade/sections/otc/capacity/OrderCapacity"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { theme } from "theme"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"
import { safeConvertAddressSS58 } from "utils/formatting"
import {
  OrderAssetColumn,
  OrderPairColumn,
  OrderPriceColumn,
} from "sections/trade/sections/otc/orders/OtcOrdersData"
import { OrderTableData } from "sections/trade/sections/otc/orders/OtcOrdersData.utils"
import { SActionButtonsContainer } from "./OtcOrderActions.styled"

type Props = {
  row?: OrderTableData
  onClose: () => void
  onFillOrder: (data: OrderTableData) => void
  onCloseOrder: (data: OrderTableData) => void
}

export const OtcOrderActionsMob = ({
  row,
  onClose,
  onFillOrder,
  onCloseOrder,
}: Props) => {
  const { t } = useTranslation()
  const { account } = useAccount()

  if (!row) return null

  const userAddress = safeConvertAddressSS58(
    account?.address,
    HYDRA_ADDRESS_PREFIX,
  )
  const orderOwner = row.owner

  return (
    <Modal open={!!row} isDrawer onClose={onClose} title="">
      <div>
        <div>
          <div
            sx={{
              flex: "row",
              justify: "space-between",
              align: "center",
              pb: 30,
            }}
          >
            <OrderPairColumn
              accepting={row.accepting}
              offering={row.offering}
              pol={row.pol}
            />
            <OrderPriceColumn symbol={row.accepting.symbol} price={row.price} />
          </div>
        </div>
        <Separator
          css={{ background: `rgba(${theme.rgbColors.alpha0}, 0.06)` }}
        />
        <div sx={{ flex: "row", justify: "space-between", py: 30 }}>
          <div sx={{ flex: "column", gap: 4 }}>
            <Text fs={14} lh={16} color="whiteish500">
              {t("otc.offers.table.header.offering")}
            </Text>
            <OrderAssetColumn pair={row.offering} />
          </div>
          <div sx={{ flex: "column", gap: 4 }}>
            <Text fs={14} lh={16} color="whiteish500">
              {t("otc.offers.table.header.accepting")}
            </Text>
            <OrderAssetColumn pair={row.accepting} />
          </div>
        </div>
        <SActionButtonsContainer>
          <div
            sx={{
              flex: "row",
              justify: "space-between",
              py: 30,
              align: "center",
            }}
          >
            {row.accepting.initial && row.partiallyFillable ? (
              <OrderCapacity
                total={row.accepting.initial}
                free={row.accepting.amount}
                symbol={row.accepting.symbol}
              />
            ) : (
              <Text
                sx={{ width: "100%" }}
                fs={12}
                fw={400}
                color="basic400"
                tAlign={"center"}
                as="div"
              >
                N / A
              </Text>
            )}
          </div>
          <div sx={{ flex: "column", gap: 12 }}>
            {orderOwner === userAddress && (
              <Button
                sx={{ width: "100%" }}
                onClick={() => onCloseOrder(row)}
                disabled={!account}
                variant={"error"}
              >
                <PauseIcon />
                {t("otc.offers.table.actions.cancel")}
              </Button>
            )}
            {orderOwner !== userAddress && (
              <Button
                sx={{ width: "100%" }}
                onClick={() => onFillOrder(row)}
                disabled={!account}
              >
                <FillIcon sx={{ mr: 4 }} />
                {t("otc.offers.table.actions.fill")}
              </Button>
            )}
          </div>
        </SActionButtonsContainer>
      </div>
    </Modal>
  )
}
