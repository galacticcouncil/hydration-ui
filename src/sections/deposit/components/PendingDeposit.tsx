import {
  DepositConfig,
  DepositMethod,
  DepositScreen,
} from "sections/deposit/types"
import { SContainer } from "./PendingDeposit.styled"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { Icon } from "components/Icon/Icon"
import { CEX_CONFIG, useDepositStore } from "sections/deposit/DepositPage.utils"
import { useTranslation } from "react-i18next"
import { Button } from "components/Button/Button"
import { isBigInt } from "utils/types"
import { useShallow } from "hooks/useShallow"
import { pick } from "utils/rx"
import React from "react"
import { useInterval, useUpdate } from "react-use"
import { useRpcProvider } from "providers/rpcProvider"
import ClockIcon from "assets/icons/ClockIcon.svg?react"

const DepositTimestamp: React.FC<{ timestamp: number }> = ({ timestamp }) => {
  const { t } = useTranslation()
  const update = useUpdate()

  const interval = timestamp < Date.now() - 60000 ? 60000 : 1000

  useInterval(update, interval)

  return (
    <Text fs={13} color="basic400">
      {t("toast.date", {
        value: timestamp,
      })}
    </Text>
  )
}

export const PendingDeposit: React.FC<DepositConfig> = ({
  asset,
  cexId,
  amount,
  createdAt,
}) => {
  const { isLoaded } = useRpcProvider()
  const { t } = useTranslation()
  const cex = CEX_CONFIG.find((cex) => cex.id === cexId)!

  const { setAsset, setMethod, paginateTo, setAmount } = useDepositStore(
    useShallow((state) =>
      pick(state, ["setAsset", "setMethod", "paginateTo", "setAmount"]),
    ),
  )

  const amountBigInt = BigInt(amount)
  const isValidAmount = isBigInt(amountBigInt) && amountBigInt > 0n

  return (
    <SContainer>
      <div sx={{ flex: "row", gap: 10, align: "center" }}>
        <Icon size={30} icon={<cex.icon />} />
        <Icon size={24} icon={<AssetLogo id={asset.assetId} />} />
      </div>
      <div sx={{ flex: "column" }}>
        {isValidAmount ? (
          <Text fs={13}>
            {t("value.tokenWithSymbol", {
              value: amount,
              symbol: asset.data.asset.originSymbol,
              fixedPointScale: asset.data.decimals,
            })}
          </Text>
        ) : (
          <Text fs={13}>{t("deposit.cex.awaiting.title")}</Text>
        )}
        <DepositTimestamp timestamp={createdAt} />
      </div>
      <Text
        fs={14}
        color="brightBlue300"
        sx={{ flex: "row", align: "center", gap: 4 }}
      >
        <Icon size={14} icon={<ClockIcon />} />
        {t("deposit.cex.transfer.ongoing.status")}
      </Text>
      <Button
        size="small"
        variant="primary"
        disabled={!isValidAmount || !isLoaded}
        onClick={() => {
          setMethod(DepositMethod.DepositCex)
          setAsset(asset)
          paginateTo(DepositScreen.Transfer)
          setAmount(amount)
        }}
      >
        {t("deposit.cex.transfer.finish")}
      </Button>
    </SContainer>
  )
}
