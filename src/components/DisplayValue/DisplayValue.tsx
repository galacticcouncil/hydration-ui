import BigNumber from "bignumber.js"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useDisplayAssetStore } from "utils/displayAsset"

type Props = {
  value: BigNumber | number | null | ReactNode
  isUSD?: boolean
  withGap?: boolean
  compact?: boolean
  type?: "dollar" | "token"
}

export const DisplayValue = ({
  value,
  isUSD,
  type = "dollar",
  compact = false,
  withGap,
}: Props) => {
  const { t } = useTranslation()
  const store = useDisplayAssetStore()

  const isDollar = isUSD || store.isRealUSD || store.isStableCoin
  const isNumber = BigNumber.isBigNumber(value) || typeof value === "number"

  return (
    <>
      {isDollar && <span sx={{ mr: withGap ? [2, 4] : undefined }}>$</span>}
      {isNumber
        ? t(compact ? "value.compact" : "value", { value, type })
        : value}
      {!isDollar && <>&nbsp;{store.symbol}</>}
    </>
  )
}
