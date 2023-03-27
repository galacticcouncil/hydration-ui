import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { ReactComponent as FillIcon } from "assets/icons/Fill.svg"
import { ReactComponent as PauseIcon } from "assets/icons/PauseIcon.svg"
import { theme } from "theme"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { useAccountStore } from "state/store"
import {
  OrderAssetColumn,
  OrderPairColumn,
  OrderPriceColumn,
} from "../OtcOrdersData"
import { OrderTableData } from "../OtcOrdersData.utils"
import { safeConvertAddressSS58 } from "utils/formatting"
import { OrderCapacity } from "sections/otc/capacity/OrderCapacity"
import { SActionButtonsContainer } from "./OtcOrderActions.styled"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"

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
  const { account } = useAccountStore()

  if (!row) return null

  const userAddress = safeConvertAddressSS58(
    account?.address,
    HYDRA_ADDRESS_PREFIX,
  )
  const orderOwner = row.owner

  return (
    <Modal open={!!row} isDrawer onClose={onClose}>
      <div>
        <div
          sx={{
            flex: "row",
            justify: "space-between",
            align: "center",
            pb: 30,
          }}
        >
          <OrderPairColumn accepting={row.accepting} offering={row.offering} />
          <OrderPriceColumn symbol={row.accepting.symbol} price={row.price} />
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
            {row.offering.initial && row.partiallyFillable ? (
              <OrderCapacity
                total={row.offering.initial}
                free={row.offering.amount}
                symbol={row.offering.symbol}
                //modal={true}
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

            {/*  <div sx={{ flex: "column", gap: 4, pt: 20, pb: 30 }}>
              <Text fs={14} lh={16} color="whiteish500">
                {t("wallet.assets.table.details.lockedDemocracy")}
              </Text>
              <Text fs={14} lh={14} color="white">
                {t("value", { value: row.lockedDemocracy })}
              </Text>
              <Text fs={12} lh={17} color="whiteish500">
                {t("value.usd", { amount: row.lockedDemocracyUSD })}
              </Text>
            </div>
            <div sx={{ flex: "column", gap: 4, pt: 20, pb: 30 }}>
              <Text fs={14} lh={16} color="whiteish500">
                {t("wallet.assets.table.details.lockedVesting")}
              </Text>
              <Text fs={14} lh={14} color="white">
                {t("value", { value: row.lockedVesting })}
              </Text>
              <Text fs={12} lh={17} color="whiteish500">
                {t("value.usd", { amount: row.lockedVestingUSD })}
              </Text>
            </div> */}
          </div>
          <div sx={{ flex: "column", gap: 12 }}>
            {orderOwner === userAddress && (
              <Button
                sx={{ width: "100%" }}
                onClick={() => onCloseOrder(row)}
                disabled={false}
                variant={"error"}
              >
                <PauseIcon />
                {t("otc.offers.table.actions.close")}
              </Button>
            )}
            {orderOwner !== userAddress && (
              <Button
                sx={{ width: "100%" }}
                onClick={() => onFillOrder(row)}
                disabled={false}
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
