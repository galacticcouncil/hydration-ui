import { forwardRef } from "react"
import { ToastMessage } from "state/store"
import { Trans, useTranslation } from "react-i18next"
import { useClaimFarmMutation } from "utils/farms/claiming"
import { TOAST_MESSAGES } from "state/toasts"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { SClaimButton, SContent } from "./ClaimAllDrowpdown.styled"
import { Text } from "components/Typography/Text/Text"
import { Spacer } from "components/Spacer/Spacer"
import { Separator } from "components/Separator/Separator"
import { theme } from "theme"
import Skeleton from "react-loading-skeleton"
import { LazyMotion, domAnimation } from "framer-motion"
import { useAssets } from "providers/assets"
import {
  useAccountClaimableFarmValues,
  useSummarizeClaimableValues,
} from "api/farms"
import BigNumber from "bignumber.js"

type Props = { onClose: () => void }

export const ClaimAllContent = forwardRef<HTMLDivElement, Props>(
  ({ onClose }, ref) => {
    const { t } = useTranslation()
    const { getAssetWithFallback } = useAssets()

    const { data: claimableValuesMap, isLoading } =
      useAccountClaimableFarmValues()

    const claimableValues = claimableValuesMap
      ? Array.from(claimableValuesMap.entries()).flatMap(
          ([key, value]) => value,
        )
      : []

    const { claimableTotal, claimableAssetValues } =
      useSummarizeClaimableValues(claimableValues)

    const claimableAssets = Object.keys(claimableAssetValues ?? {}).map(
      (key) => {
        const asset = getAssetWithFallback(key)
        return {
          value: claimableAssetValues[key],
          symbol: asset.symbol,
        }
      },
    )

    const toast = TOAST_MESSAGES.reduce((memo, type) => {
      const msType = type === "onError" ? "onLoading" : type
      memo[type] = (
        <>
          <Trans i18nKey={`farms.claimCard.toast.${msType}`}>
            <span />
          </Trans>
          <DisplayValue value={claimableTotal} type="token" />
        </>
      )
      return memo
    }, {} as ToastMessage)

    const { claim } = useClaimFarmMutation(claimableValues, toast, onClose)

    return (
      <LazyMotion features={domAnimation}>
        <SContent
          ref={ref}
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          transition={{
            type: "spring",
            mass: 1,
            stiffness: 300,
            damping: 20,
            duration: 0.3,
          }}
          css={{ overflow: "hidden" }}
        >
          <div sx={{ p: 34, flex: "column" }}>
            <Text font="GeistMonoSemiBold">{t("farms.claimCard.title")}</Text>
            <Spacer size={16} />
            {isLoading && <Skeleton height={25} width={150} />}
            {claimableAssets.map((claimableAsset, index) => (
              <div key={claimableAsset.symbol} sx={{ mt: 8 }}>
                <Text fs={16} lh={19} sx={{ mb: 8 }} font="GeistMedium">
                  {t("value.tokenWithSymbol", {
                    value: claimableAsset.value.claimableRewards,
                    symbol: claimableAsset.symbol,
                  })}
                </Text>
                {index < claimableAssets.length - 1 && (
                  <Separator
                    css={{
                      background: `rgba(${theme.rgbColors.white}, 0.06)`,
                    }}
                  />
                )}
              </div>
            ))}

            <Text fs={14} sx={{ mt: 6, mb: 24 }}>
              <Trans t={t} i18nKey="farms.claimCard.claim.usd">
                <DisplayValue value={BigNumber(claimableTotal)} />
              </Trans>
            </Text>

            <SClaimButton
              disabled={!claimableValues || BigNumber(claimableTotal).isZero()}
              onClick={claim}
            >
              <Text fs={13} tTransform="uppercase" tAlign="center">
                {t("farms.claimCard.button.label")}
              </Text>
            </SClaimButton>

            <Spacer size={12} />
          </div>
        </SContent>
      </LazyMotion>
    )
  },
)
