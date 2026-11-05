import { OptionCard, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { AssetRoute } from "@galacticcouncil/xc-core"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  useCrossChainWallet,
  xcmDestinationFeeQuery,
  xcmTransferQuery,
} from "@/api/xcm"
import { getDepositTokenProvenance } from "@/modules/onramp/deposit/preview/DepositTransfer.utils"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import {
  BRIDGE_LABEL,
  BRIDGE_TIME,
  getPrimaryBridgeTag,
  isSnowbridgeV1Route,
} from "@/modules/xcm/transfer/utils/bridge"
import {
  calculateTransferDestAmount,
  getXcmTransferArgs,
} from "@/modules/xcm/transfer/utils/transfer"
import { XcmTag } from "@/states/transactions"

type DepositRouteOptionProps = {
  route: AssetRoute
  isActive: boolean
  enabled: boolean
  onSelect: () => void
}

export const DepositRouteOption: FC<DepositRouteOptionProps> = ({
  route,
  isActive,
  enabled,
  onSelect,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { account } = useAccount()
  const wallet = useCrossChainWallet()
  const { watch } = useFormContext<XcmFormValues>()
  const values = watch()
  const tag = getPrimaryBridgeTag(route)
  const provider = isSnowbridgeV1Route(route) ? XcmTag.SnowbridgeV1 : tag
  const args = getXcmTransferArgs(
    account,
    {
      ...values,
      destAsset: route.destination.asset,
      bridgeProvider: provider,
    },
    { automaticBridgeSelection: true },
  )
  const canQuote =
    enabled &&
    Number.isFinite(Number(values.srcAmount)) &&
    Number(values.srcAmount) > 0
  const query = useQuery(
    xcmTransferQuery(wallet, args, { enabled: canQuote && !!args }),
  )
  const transfer = query.isPlaceholderData ? null : (query.data ?? null)
  const fee = useQuery(
    xcmDestinationFeeQuery(canQuote ? transfer : null, values.srcAmount, args),
  )
  const provenance = getDepositTokenProvenance(tag)
  const symbol = route.destination.asset.originSymbol
  const arrivingToken = provenance
    ? t(`deposit.v3.token.${provenance}`, { symbol })
    : symbol
  const quotedFee = fee.isPlaceholderData ? undefined : fee.data
  const received =
    transfer && values.srcAsset && values.srcAmount
      ? calculateTransferDestAmount(
          values.srcAsset,
          values.srcAmount,
          transfer,
          !!route.destination.fee.prepaid,
          quotedFee,
        )
      : ""
  const sourceFee = transfer?.source.fee
  const sourceFeeLabel =
    sourceFee &&
    t("common:currency", {
      value: sourceFee.toDecimal(),
      symbol: sourceFee.originSymbol,
    })
  const destinationFeeLabel =
    quotedFee && quotedFee.amount > 0n
      ? t("common:currency", {
          value: quotedFee.toDecimal(),
          symbol: quotedFee.originSymbol,
        })
      : undefined
  const fees =
    sourceFeeLabel && !fee.isError && !fee.isPending
      ? [sourceFeeLabel, destinationFeeLabel].filter(Boolean).join(" + ")
      : undefined
  const quote = !values.srcAmount
    ? t("deposit.v3.amount.quoteEnterAmount")
    : query.isError || fee.isError || transfer?.source.fee.amount === 0n
      ? t("deposit.v3.amount.quoteUnavailable")
      : !canQuote || !transfer || !fees || !received
        ? t("deposit.v3.amount.quoteLoading")
        : t("deposit.v3.amount.routeQuote", {
            amount: t("common:currency", {
              value: received,
              symbol: arrivingToken,
            }),
            fees,
          })
  return (
    <Stack gap="xs" justify="flex-start">
      <OptionCard
        label={arrivingToken}
        value={tag ? (BRIDGE_LABEL[tag] ?? tag) : "XCM"}
        description={
          tag && BRIDGE_TIME[tag]
            ? t("deposit.v3.amount.routeEstimate", { time: BRIDGE_TIME[tag] })
            : undefined
        }
        isActive={isActive}
        onClick={onSelect}
      />
      <Text px="m" fs="p6" color={getToken("text.medium")}>
        {quote}
      </Text>
    </Stack>
  )
}
