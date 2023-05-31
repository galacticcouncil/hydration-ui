import BigNumber from "bignumber.js"
import { SRow, SSliceLabelContainer } from "./SliceLabelRest.styled"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { Spacer } from "components/Spacer/Spacer"
import { SSeparator } from "components/Separator/Separator.styled"
import { theme } from "theme"
import { Fragment } from "react"

export type TLabelRest = {
  name: string
  percentage: number
  tvl: BigNumber
}

export const SliceLabelRest = ({ assets }: { assets: TLabelRest[] }) => {
  const { t } = useTranslation()
  return (
    <SSliceLabelContainer
      key="modal"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <SRow>
        <Text
          fs={14}
          color="basic100"
          tTransform="uppercase"
          font="ChakraPetchBold"
        >
          {t("stats.overview.pie.rest.header.assets")}
        </Text>
        <Text
          fs={14}
          tTransform="uppercase"
          sx={{ color: "white", opacity: 0.4 }}
        >
          %
        </Text>
        <Text
          fs={14}
          tTransform="uppercase"
          sx={{ color: "white", opacity: 0.4 }}
        >
          {t("stats.overview.pie.rest.header.tvl")}
        </Text>
      </SRow>
      <Spacer size={24} />
      {assets.map((asset, index) => {
        const isNotLastEl = assets.length > index + 1

        return (
          <Fragment key={asset.name}>
            <SRow>
              <Text fs={14} color="basic100">
                {asset.name}
              </Text>
              <Text fs={14} color="basic100">
                {asset.percentage}%
              </Text>
              <Text fs={14} color="basic100">
                {t("value.usd", { amount: asset.tvl })}
              </Text>
            </SRow>
            {isNotLastEl ? (
              <SSeparator
                sx={{
                  my: 8,
                  mx: "var(--x-padding)",
                  width: "calc(100% - var(--x-padding) * 2)",
                }}
                css={{ background: `rgba(${theme.rgbColors.white}, 0.06)` }}
              />
            ) : null}
          </Fragment>
        )
      })}
    </SSliceLabelContainer>
  )
}
