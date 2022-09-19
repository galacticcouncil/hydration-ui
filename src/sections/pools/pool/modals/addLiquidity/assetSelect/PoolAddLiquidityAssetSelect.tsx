import { ChevronDown } from "assets/icons/ChevronDown"
import { MarginProps } from "utils/styles"
import { AssetInput } from "components/AssetInput/AssetInput"
import { Box } from "components/Box/Box"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import {
  SContainer,
  SMaxButton,
  SSelectAssetButton,
} from "./PoolAddLiquidityAssetSelect.styled"
import { u32 } from "@polkadot/types"

type Props = {
  name: string
  asset: u32
  balance: string
  usd: number
  currency: { short: string; full: string }
  assetIcon: ReactNode
  value: string
  onChange: (v: string) => void
} & MarginProps

export const PoolAddLiquidityAssetSelect: FC<Props> = ({
  name,
  value,
  onChange,
  asset,
  balance,
  ...p
}) => {
  const { t } = useTranslation()

  return (
    <SContainer {...p}>
      <Box flex acenter spread mb={11}>
        <Text fw={600} lh={22} color="primary200">
          {t("selectAsset.title")}
        </Text>
        <Box flex acenter>
          <Text fs={12} mr={2} lh={16} opacity={0.7} color="white">
            {t("selectAsset.balance")}
          </Text>
          <Text fs={12} lh={16} mr={5}>
            {balance}
          </Text>
          <SMaxButton
            size="micro"
            text={t("selectAsset.button.max")}
            capitalize
            onClick={() => onChange(balance.toString())}
          />
        </Box>
      </Box>
      <Box flex spread acenter>
        <SSelectAssetButton size="small">
          <Icon icon={p.assetIcon} mr={10} />
          <Box mr={6}>
            <Text fw={700} color="white">
              {p.currency.short}
            </Text>
            <Text color="neutralGray400" fs={12} lh={14}>
              {p.currency.full}
            </Text>
          </Box>
          <Icon icon={<ChevronDown />} />
        </SSelectAssetButton>
        <AssetInput
          value={value}
          name={name}
          label={t("selectAsset.input.label")}
          onChange={onChange}
          dollars="1234 USD"
          unit={p.currency.short}
        />
      </Box>
    </SContainer>
  )
}
