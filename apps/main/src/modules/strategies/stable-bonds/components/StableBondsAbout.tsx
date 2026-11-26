import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  PaperProps,
} from "@galacticcouncil/ui/components"
import { millisecondsInDay } from "date-fns/constants"
import { useTranslation } from "react-i18next"

import { useBondData } from "@/api/bonds"
import { Markdown } from "@/components/Markdown"
import { useStableBondsConfig } from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import {
  getBondApr,
  getDefaultBondApr,
} from "@/modules/strategies/stable-bonds/utils/apr"
import { useAssets } from "@/providers/assetsProvider"

export type StableBondsAboutProps = PaperProps & {
  isSoldOut?: boolean
}

export const StableBondsAbout: React.FC<StableBondsAboutProps> = ({
  isSoldOut,
  ...props
}) => {
  const { t } = useTranslation(["common", "strategies"])
  const config = useStableBondsConfig()
  const { getBond, getAssetWithFallback } = useAssets()
  const bond = getBond(config.bondId)
  const { timeLeft } = useBondData(config.bondId)

  if (!config.contentId || !bond) return null

  const underlyingAsset = getAssetWithFallback(bond.underlyingAssetId)
  const apr = isSoldOut
    ? getDefaultBondApr(config.bondId)
    : getBondApr(config.bondId, timeLeft)

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>
          {t("strategies:about.title", {
            suffix: t("strategies:bonds.title.stableYieldBonds", {
              symbol: underlyingAsset.symbol,
            }),
          })}
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Markdown
          id={config.contentId}
          muted
          size="small"
          values={{
            soldOut: isSoldOut ?? false,
            daysLeft: t("interval", {
              value: timeLeft,
              largest: 1,
              ...(timeLeft > millisecondsInDay && { unit: "d" }),
            }),
            apr: apr
              ? t("common:percent", {
                  value: apr,
                  ...(isSoldOut
                    ? { maximumFractionDigits: 2, suffix: "+" }
                    : { minimumFractionDigits: 2 }),
                })
              : "",
          }}
        />
      </CardBody>
    </Card>
  )
}
