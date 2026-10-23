import { Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { DepositRouteOption } from "@/modules/onramp/deposit/preview/components/DepositRouteOption"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import {
  getAutomaticBridgeProvider,
  resolveAutomaticBridgeRoute,
} from "@/modules/xcm/transfer/utils/automaticRoute"

type DepositRouteSelectProps = { enabled?: boolean }

export const DepositRouteSelect: FC<DepositRouteSelectProps> = ({
  enabled = true,
}) => {
  const { t } = useTranslation("onramp")
  const { destChainAssetPairs, selectedRoute } = useXcmProvider()
  const { watch, setValue } = useFormContext<XcmFormValues>()
  const [destChain, destAsset] = watch(["destChain", "destAsset"])
  const pair = destChainAssetPairs.find(
    (pair) => pair.chain.key === destChain?.key,
  )
  const options = (pair?.assets ?? []).flatMap((asset) => {
    const route = resolveAutomaticBridgeRoute(pair?.routes ?? [], asset)
    return route ? [route] : []
  })
  if (options.length < 2) return null
  return (
    <Stack px="xl" py="m" gap="m" justify="flex-start">
      <Text fs="p5" color={getToken("text.medium")}>
        {t("deposit.v3.amount.chooseRoute")}
      </Text>
      {options.map((option) => {
        const active = destAsset?.key === option.destination.asset.key
        const route = active && selectedRoute ? selectedRoute : option
        return (
          <DepositRouteOption
            key={option.destination.asset.key}
            route={route}
            isActive={active}
            enabled={enabled}
            onSelect={() => {
              if (active) return
              setValue("destAsset", route.destination.asset, {
                shouldValidate: true,
              })
              setValue("bridgeProvider", getAutomaticBridgeProvider(route))
              setValue("destAmount", "")
            }}
          />
        )
      })}
      <Text fs="p6" color={getToken("text.low")}>
        {t("deposit.v3.amount.quoteFeeNote")}
      </Text>
    </Stack>
  )
}
