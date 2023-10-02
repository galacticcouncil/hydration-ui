import { css } from "@emotion/react"
import ChevronDown from "assets/icons/ChevronDown.svg?react"
import BigNumber from "bignumber.js"
import { SErrorMessage } from "components/AddressInput/AddressInput.styled"
import { AssetInput } from "components/AssetInput/AssetInput"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { ReactNode, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { getFloatingPointAmount } from "utils/balance"
import { useDisplayPrice } from "utils/displayAsset"
import { Maybe } from "utils/helpers"
import {
  SContainer,
  SMaxButton,
  SSelectAssetButton,
} from "./AssetSelect.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { AssetLogo } from "components/AssetIcon/AssetIcon"

export const AssetSelect = (props: {
  name: string
  value: string
  error?: string

  title: ReactNode
  className?: string
  disabled?: boolean

  id: string
  balance: Maybe<BigNumber>
  balanceLabel: string
  withoutMaxValue?: boolean
  withoutMaxBtn?: boolean

  onBlur?: (v: string) => void
  onChange: (v: string) => void
  onSelectAssetClick?: () => void
}) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const asset = assets.getAsset(props.id)
  const { decimals, name, symbol } = asset

  const spotPriceId =
    assets.isBond(asset) && asset.isPast ? asset.assetId : asset.id

  const iconId = assets.isBond(asset) ? asset.assetId : asset.id

  const spotPrice = useDisplayPrice(spotPriceId)

  const displayValue = useMemo(() => {
    if (!props.value) return 0
    if (spotPrice.data?.spotPrice == null) return null
    return spotPrice.data.spotPrice.times(props.value)
  }, [props.value, spotPrice.data])

  return (
    <>
      <SContainer
        className={props.className}
        htmlFor={props.name}
        error={!!props.error}
        disabled={props.disabled}
      >
        <div sx={{ flex: "row", justify: "space-between" }}>
          <Text
            fw={500}
            fs={12}
            lh={22}
            tTransform="uppercase"
            color="whiteish500"
          >
            {props.title}
          </Text>
          {!props.withoutMaxValue && (
            <div
              sx={{ flex: "row", align: "center", pt: [5, 0], justify: "end" }}
            >
              <Text
                fs={11}
                lh={16}
                sx={{ mr: 5 }}
                css={{ color: `rgba(${theme.rgbColors.white}, 0.7)` }}
              >
                {props.balanceLabel}
              </Text>
              <Text fs={11} lh={16} sx={{ mr: 5 }}>
                {t("selectAsset.balance.value", {
                  balance: props.balance,
                  fixedPointScale: decimals,
                  type: "token",
                })}
              </Text>

              {!props.withoutMaxBtn && (
                <SMaxButton
                  size="micro"
                  text={t("selectAsset.button.max")}
                  onClick={(e) => {
                    e.preventDefault()
                    if (props.balance != null) {
                      const value = getFloatingPointAmount(
                        props.balance,
                        decimals,
                      ).toString()
                      props.onChange(value)
                      props.onBlur?.(value)
                    }
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div
          sx={{
            flex: ["column", "row"],
            align: ["flex-start", "center"],
            justify: "space-between",
            gap: [12, 0],
            mt: [16, 0],
          }}
        >
          <SSelectAssetButton
            size="small"
            onClick={(e) => {
              e.preventDefault()
              props.onSelectAssetClick?.()
            }}
          >
            <Icon icon={<AssetLogo id={iconId} />} size={30} />

            <div sx={{ flex: "column", justify: "space-between" }}>
              <Text fw={700} lh={16} color="white">
                {symbol}
              </Text>
              <Text
                fs={13}
                lh={13}
                css={{
                  whiteSpace: "nowrap",
                  color: `rgba(${theme.rgbColors.whiteish500}, 0.6)`,
                }}
              >
                {name}
              </Text>
            </div>

            {props.onSelectAssetClick && <Icon icon={<ChevronDown />} />}
          </SSelectAssetButton>

          <AssetInput
            disabled={props.disabled}
            value={props.value}
            name={props.name}
            label={t("selectAsset.input.label")}
            onBlur={props.onBlur}
            onChange={props.onChange}
            displayValue={displayValue}
            placeholder="0.00"
            unit={symbol}
            error={props.error}
            css={css`
              & > label {
                padding: 0;
              }
            `}
          />
        </div>
      </SContainer>
      {props.error && <SErrorMessage>{props.error}</SErrorMessage>}
    </>
  )
}
