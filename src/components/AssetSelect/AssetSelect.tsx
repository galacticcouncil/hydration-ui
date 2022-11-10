import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { AssetInput } from "components/AssetInput/AssetInput"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { ReactNode, useMemo } from "react"
import { Trans, useTranslation } from "react-i18next"
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

export const AssetSelect = (props: {
  name: string
  value: string

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
      <SContainer className={props.className}>
        <Text fw={500} lh={22} color="primary200" css={{ gridArea: "title" }}>
          {props.title}
        </Text>
        <div
          sx={{ flex: "row", align: "center", pt: [5, 0], justify: "end" }}
          css={{ gridArea: "balance" }}
        >
          <Text fs={12} lh={16} color="white" sx={{ mr: 5 }}>
            <Trans
              t={t}
              i18nKey="selectAsset.balance"
              tOptions={{
                balance: props.balance,
                decimalPlaces: 4,
                fixedPointScale: props.decimals,
              }}
            >
              <span css={{ opacity: 0.7 }} />
            </Trans>
          </Text>
          <SMaxButton
            size="micro"
            text={t("selectAsset.button.max")}
            capitalize
            onClick={() => {
              if (props.decimals != null && props.balance != null) {
                props.onChange(
                  getFloatingPointAmount(props.balance, props.decimals).toFixed(
                    4,
                  ),
                )
              }
            }}
          />
        </div>
        <div
          sx={{ flex: "row", align: "center", justify: "space-between" }}
          css={{ gridArea: "input" }}
        >
          <SSelectAssetButton size="small" onClick={props.onSelectAssetClick}>
            <Icon icon={props.assetIcon} />
            {props.assetName && (
              <div>
                <Text fw={700} color="white">
                  {props.assetName}
                </Text>
                <Text
                  css={{ whiteSpace: "nowrap" }}
                  color="neutralGray400"
                  fs={12}
                  lh={14}
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
            unit={props.assetName}
          />
        </div>
      </SContainer>
    </>
  )
}
