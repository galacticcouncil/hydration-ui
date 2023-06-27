import BigNumber from "bignumber.js"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useDisplayAssetStore } from "utils/displayAsset"

type Props = {
  value: BigNumber | number | null | ReactNode
  isUSD?: boolean
  type?: "dollar" | "token"
}

export const DisplayValue = ({ value, isUSD, type = "dollar" }: Props) => {
  const { t } = useTranslation()
  const store = useDisplayAssetStore()

  const isDollar = isUSD || store.isRealUSD || store.isStableCoin
  const isNumber = BigNumber.isBigNumber(value) || typeof value === "number"

  return (
    <>
      {isDollar && (
        <span
          css={{ all: "inherit", fontFamily: "ChakraPetch", display: "inline" }}
        >
          $
        </span>
      )}
      {isNumber ? t("value", { value, type }) : value}
      {!isDollar && <>&nbsp;{store.symbol}</>}
    </>
  )
}
