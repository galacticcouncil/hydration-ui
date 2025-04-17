import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { useTranslation } from "react-i18next"
import BN from "bignumber.js"
import i18n from "i18next"
import {
  DOT_ASSET_ID,
  GDOT_ERC20_ASSET_ID,
  GDOT_STABLESWAP_ASSET_ID,
  VDOT_ASSET_ID,
  VDOT_ERC20_ASSET_ID,
} from "utils/constants"
import { Icon } from "components/Icon/Icon"
import { Heading } from "components/Typography/Heading/Heading"
import { SContainer } from "./GDOTIncentives.styled"
import { ReactNode } from "react"
import { useBorrowAssetApy } from "api/borrow"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"

export const GDOTIncentives = () => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  return (
    <>
      <Heading
        color="white"
        fs={15}
        sx={{ mb: 5 }}
        font="GeistMono"
        tTransform="uppercase"
      >
        {t("liquidity.stablepool.incetives")}
      </Heading>
      <SContainer sx={{ flex: "row", gap: 6, justify: "space-between" }}>
        <div sx={{ flex: "row", align: "center", gap: 6 }}>
          <Icon size={20} icon={<AssetLogo id={GDOT_ERC20_ASSET_ID} />} />
          <Text fs={16} fw={600} font="GeistSemiBold" color="basic100">
            {getAssetWithFallback(GDOT_ERC20_ASSET_ID).symbol}
          </Text>
        </div>
        <GDOTAPY withLabel />
      </SContainer>
    </>
  )
}

type ApySummary = Record<string, string>

type IncentivesApyProps = {
  readonly assetId: string
  readonly summary: ApySummary
  readonly incentivesAPYAssetId?: string
  readonly withLabel?: boolean
}

const IncentivesApy = ({
  assetId,
  summary,
  withLabel,
  incentivesAPYAssetId,
}: IncentivesApyProps) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const { apy, lpAPY, incentivesAPY, underlyingAssetsAPY } =
    useBorrowAssetApy(assetId)

  return (
    <div sx={{ flex: "row", gap: 4, align: "center" }}>
      <Text color="white" fs={14} tTransform={withLabel ? "uppercase" : "none"}>
        {t(
          withLabel
            ? "liquidity.stablepool.incetives.value"
            : "value.percentage",
          { value: apy },
        )}
      </Text>
      <InfoTooltip
        preventDefault
        text={
          <>
            <Text fs={12}>{t("liquidity.table.farms.apr.description")}</Text>
            {BN(apy).gt(0) && (
              <div
                sx={{ flex: "row", gap: 4, justify: "space-between", mt: 6 }}
              >
                <Text fs={10} tTransform="uppercase" sx={{ opacity: 0.8 }}>
                  {t("liquidity.table.farms.apr.lpFee")}
                </Text>
                <Text fs={12} font="GeistSemiBold">
                  {t("value.percentage", { value: lpAPY })}
                </Text>
              </div>
            )}
            {[
              ...underlyingAssetsAPY,
              ...(incentivesAPYAssetId
                ? [{ apy: incentivesAPY, id: incentivesAPYAssetId }]
                : []),
            ].map(({ id, apy }) => {
              return (
                <div
                  key={id}
                  sx={{
                    flex: "row",
                    gap: 4,
                    justify: "space-between",
                    mt: 6,
                  }}
                >
                  <div sx={{ flex: "row", gap: 4, align: "center" }}>
                    <Icon size={14} icon={<AssetLogo id={id} />} />
                    <Text fs={12}>{getAssetWithFallback(id).symbol}</Text>
                    <Text fs={11} lh={15} color="basic400">
                      {summary[id]}
                    </Text>
                  </div>
                  <Text fs={12} font="GeistSemiBold">
                    {t("value.percentage", { value: apy })}
                  </Text>
                </div>
              )
            })}
          </>
        }
      />
    </div>
  )
}

const gDotSummary: ApySummary = {
  [GDOT_ERC20_ASSET_ID]: i18n.t("incentivesApy"),
  [DOT_ASSET_ID]: i18n.t("supplyApy"),
  [VDOT_ASSET_ID]: i18n.t("supplyAndStakeApy"),
}

const vDotSummary: ApySummary = {
  [VDOT_ASSET_ID]: i18n.t("supplyApy"),
  [VDOT_ERC20_ASSET_ID]: i18n.t("stakeApy"),
}

export const GDOTAPY = ({ withLabel }: { withLabel?: boolean }) => {
  return (
    <IncentivesApy
      assetId={GDOT_STABLESWAP_ASSET_ID}
      incentivesAPYAssetId={GDOT_ERC20_ASSET_ID}
      summary={gDotSummary}
      withLabel={withLabel}
    />
  )
}

export const VDOTAPY = ({ withLabel }: { withLabel?: boolean }) => {
  return (
    <IncentivesApy
      assetId={VDOT_ASSET_ID}
      incentivesAPYAssetId={VDOT_ERC20_ASSET_ID}
      summary={vDotSummary}
      withLabel={withLabel}
    />
  )
}

type OverrideApyProps = Omit<IncentivesApyProps, "summary"> & {
  readonly children: ReactNode
}

export const OverrideApy = ({ children, ...props }: OverrideApyProps) => {
  switch (props.assetId) {
    case GDOT_STABLESWAP_ASSET_ID:
      return <GDOTAPY {...props} />
    case VDOT_ASSET_ID:
      return <VDOTAPY {...props} />
    default:
      return children
  }
}
