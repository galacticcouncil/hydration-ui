import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { AssetInput } from "components/AssetInput/AssetInput"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { ReactNode, useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  SContainer,
  SMaxButton,
  SSelectAssetButton,
} from "./AssetSelect.styled"
import { u32 } from "@polkadot/types"
import BigNumber from "bignumber.js"
import { getFloatingPointAmount } from "utils/balance"
import { useAUSD } from "api/asset"
import { useSpotPrice } from "api/spotPrice"
import { Maybe } from "utils/helpers"
import { getAssetName } from "components/AssetIcon/AssetIcon"
import { theme } from "theme"
import { SErrorMessage } from "components/AddressInput/AddressInput.styled"

export const AssetSelect = (props: {
  name: string
  value: string
  error?: string

  title: ReactNode
  className?: string

  asset: u32 | string
  assetName: Maybe<string>
  assetIcon: Maybe<ReactNode>
  decimals: Maybe<number>
  balance: Maybe<BigNumber>

  onChange: (v: string) => void
  onSelectAssetClick: () => void
}) => {
  const { t } = useTranslation()

  const aUSD = useAUSD()
  const spotPrice = useSpotPrice(props.asset, aUSD.data?.id)

  const aUSDValue = useMemo(() => {
    if (!props.value) return null
    if (spotPrice.data?.spotPrice == null) return null
    return spotPrice.data.spotPrice.times(props.value)
  }, [props.value, spotPrice.data])

  return (
    <>
      <SContainer
        className={props.className}
        htmlFor={props.name}
        error={!!props.error}
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
          <div
            sx={{ flex: "row", align: "center", pt: [5, 0], justify: "end" }}
          >
            <Text
              fs={11}
              lh={16}
              sx={{ mr: 5 }}
              css={{ color: `rgba(${theme.rgbColors.white}, 0.7)` }}
            >
              {t("selectAsset.balance.label")}
            </Text>
            <Text fs={11} lh={16} sx={{ mr: 5 }}>
              {t("selectAsset.balance.value", {
                balance: props.balance,
              })}
            </Text>

            <SMaxButton
              size="micro"
              text={t("selectAsset.button.max")}
              onClick={(e) => {
                e.preventDefault()
                if (props.decimals != null && props.balance != null) {
                  props.onChange(
                    getFloatingPointAmount(
                      props.balance,
                      props.decimals,
                    ).toFixed(4),
                  )
                }
              }}
            />
          </div>
        </div>

        <div sx={{ flex: "row", align: "center", justify: "space-between" }}>
          <SSelectAssetButton
            size="small"
            onClick={(e) => {
              e.preventDefault()
              props.onSelectAssetClick()
            }}
          >
            <Icon icon={props.assetIcon} />
            {props.assetName && (
              <div>
                <Text fw={700} color="white">
                  {props.assetName}
                </Text>
                <Text
                  fs={12}
                  lh={14}
                  css={{
                    whiteSpace: "nowrap",
                    color: `rgba(${theme.rgbColors.whiteish500}, 0.6)`,
                  }}
                >
                  {getAssetName(props.assetName)}
                </Text>
              </div>
            )}
            <Icon icon={<ChevronDown />} />
          </SSelectAssetButton>
          <AssetInput
            value={props.value}
            name={props.name}
            label={t("selectAsset.input.label")}
            onChange={props.onChange}
            dollars={t("value.usd", { amount: aUSDValue })}
            placeholder="0.00"
            unit={props.assetName}
            error={props.error}
          />
        </div>
      </SContainer>
      {props.error && <SErrorMessage>{props.error}</SErrorMessage>}
    </>
  )
}
