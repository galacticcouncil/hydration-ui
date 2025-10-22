import {
  ComputedReserveData,
  useModalContext,
  useWalletData,
} from "@galacticcouncil/money-market/hooks"
import { isGho } from "@galacticcouncil/money-market/utils"
import { Wallet } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  Separator,
  Stack,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export type ReserveActionsProps = { reserve: ComputedReserveData }

export const ReserveActions: React.FC<ReserveActionsProps> = ({ reserve }) => {
  const { t } = useTranslation(["common", "borrow"])

  const { openBorrow, openSupply } = useModalContext()

  const {
    alerts,
    balance,
    disableBorrowButton,
    disableSupplyButton,
    maxAmountToBorrow,
    maxAmountToBorrowUsd,
    maxAmountToSupply,
    maxAmountToSupplyUsd,
  } = useWalletData(reserve)

  const isGhoReserve = isGho(reserve)

  return (
    <Stack separated gap={20} separator={<Separator mx={-20} />}>
      <Flex gap={20} align="center">
        <Icon component={Wallet} sx={{ color: getToken("text.low") }} />
        <ValueStats
          size="small"
          font="secondary"
          label={t("balance")}
          value={t("currency", {
            value: balance?.amount || "0",
            symbol: reserve.symbol,
          })}
          bottomLabel={t("currency", {
            value: balance?.amountUSD || "0",
            maximumFractionDigits: 2,
          })}
          wrap
        />
      </Flex>
      {!isGhoReserve && (
        <Flex gap={20} justify="space-between" align="center">
          <ValueStats
            size="small"
            font="secondary"
            label={t("borrow:supply.available")}
            value={t("currency", {
              value: maxAmountToSupply,
              symbol: reserve.symbol,
            })}
            bottomLabel={t("currency", {
              value: maxAmountToSupplyUsd,
              maximumFractionDigits: 2,
            })}
            wrap
          />
          <Button
            disabled={disableSupplyButton}
            onClick={() => openSupply(reserve.underlyingAsset)}
          >
            {t("borrow:supply")}
          </Button>
        </Flex>
      )}
      {reserve.borrowingEnabled && (
        <Flex gap={20} justify="space-between" align="center">
          <ValueStats
            size="small"
            font="secondary"
            label={t("borrow:borrow.available")}
            value={t("currency", {
              value: maxAmountToBorrow,
              symbol: reserve.symbol,
            })}
            bottomLabel={t("currency", {
              value: maxAmountToBorrowUsd,
              maximumFractionDigits: 2,
            })}
            wrap
          />
          <Button
            disabled={disableBorrowButton}
            onClick={() => openBorrow(reserve.underlyingAsset)}
          >
            {t("borrow:borrow")}
          </Button>
        </Flex>
      )}
      {alerts.length > 0 && <Stack gap={10}>{alerts}</Stack>}
    </Stack>
  )
}
