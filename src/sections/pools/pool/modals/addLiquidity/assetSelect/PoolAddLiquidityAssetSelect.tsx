import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { AssetInput } from "components/AssetInput/AssetInput"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { FC, ReactNode, useMemo } from "react"
import { Trans, useTranslation } from "react-i18next"
import {
  SContainer,
  SMaxButton,
  SSelectAssetButton,
} from "./PoolAddLiquidityAssetSelect.styled"
import { u32 } from "@polkadot/types"
import BigNumber from "bignumber.js"
import { getFloatingPointAmount } from "utils/balance"
import { useAssetsModal } from "sections/assets/AssetsModal.utils"
import { useAUSD } from "api/asset"
import { useSpotPrice } from "api/spotPrice"
import { Maybe } from "utils/helpers"

type Props = {
  name: string
  asset: u32 | string
  balance: BigNumber | undefined
  decimals: number
  currency: { short: string; full: string }
  assetIcon: ReactNode
  allowedAssets?: Maybe<u32 | string>[]
  onSelectAsset?: (id: u32 | string) => void
  value: string
  className?: string
  onChange: (v: string) => void
}

export const PoolAddLiquidityAssetSelect: FC<Props> = (props) => {
  const { t } = useTranslation()
  const { openModal, modal } = useAssetsModal({
    allowedAssets: props.allowedAssets,
    onSelect: props.onSelectAsset,
  })

  const aUSD = useAUSD()
  const spotPrice = useSpotPrice(props.asset, aUSD.data?.id)

  const aUSDValue = useMemo(() => {
    if (!props.value) return null
    if (spotPrice.data?.spotPrice == null) return null
    return spotPrice.data.spotPrice.times(props.value)
  }, [props.value, spotPrice.data])

  return (
    <>
      {modal}
      <SContainer className={props.className}>
        <Text fw={500} lh={22} color="primary200">
          {t("selectAsset.title")}
        </Text>
        <div sx={{ flex: "row", align: "center", pt: [5, 0], justify: "end" }}>
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
              if (props.balance != null) {
                props.onChange(
                  getFloatingPointAmount(props.balance, props.decimals).toFixed(
                    4,
                  ),
                )
              }
            }}
          />
        </div>
        <div sx={{ flex: "row", align: "center", justify: "space-between" }}>
          <SSelectAssetButton size="small" onClick={openModal}>
            <Icon icon={props.assetIcon} />
            <div>
              <Text fw={700} color="white">
                {props.currency.short}
              </Text>
              <Text color="neutralGray400" fs={12} lh={14}>
                {props.currency.full}
              </Text>
            </div>
            <Icon icon={<ChevronDown />} />
          </SSelectAssetButton>
          <AssetInput
            value={props.value}
            name={props.name}
            label={t("selectAsset.input.label")}
            onChange={props.onChange}
            dollars={t("value.usd", { amount: aUSDValue })}
            unit={props.currency.short}
          />
        </div>
      </SContainer>
    </>
  )
}
