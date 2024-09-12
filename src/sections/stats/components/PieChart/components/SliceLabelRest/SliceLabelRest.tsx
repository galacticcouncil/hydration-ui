import BigNumber from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { SSeparator } from "components/Separator/Separator.styled"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { SRow, SSliceLabelContainer } from "./SliceLabelRest.styled"

export type TLabelRest = {
  name: string
  percentage: number
  value: BigNumber
}

export const SliceLabelRest = ({
  assets,
  property,
}: {
  assets: TLabelRest[]
  property: string
}) => {
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
          font="GeistMedium"
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
          {t(
            `stats.pie.rest.header.${property}` as unknown as TemplateStringsArray,
          )}
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
                <DisplayValue value={asset.value} isUSD />
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
