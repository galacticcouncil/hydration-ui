import { ChevronDown } from "assets/icons/ChevronDown"
import { MarginProps } from "common/styles"
import { AssetInput } from "components/AssetInput/AssetInput"
import { Box } from "components/Box/Box"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { getFormattedNumber } from "utils/formatting"
import {
  AssetWrapper,
  MaxButton,
  SelectAssetButton,
} from "./SelectAsset.styled"

type SelectAssetProps = {
  balance: number
  usd: number
  currency: { short: string; full: string }
  assetIcon: ReactNode
  value: string
  onChange: (v: string) => void
} & MarginProps

export const SelectAsset: FC<SelectAssetProps> = ({
  value,
  onChange,
  ...p
}) => {
  const { t } = useTranslation()

  return (
    <AssetWrapper {...p}>
      <Box flex acenter spread mb={11}>
        <Text fw={600} lh={22} color="primary200">
          {t("selectAsset.title")}
        </Text>
        <Box flex acenter>
          <Text fs={12} mr={2} lh={16} opacity={0.7} color="white">
            {t("selectAsset.balance")}
          </Text>
          <Text fs={12} lh={16} mr={5}>
            {getFormattedNumber(p.balance)}
          </Text>
          <MaxButton
            size="micro"
            text={t("selectAsset.button.max")}
            capitalize
            onClick={() => onChange(p.balance.toString())}
          />
        </Box>
      </Box>
      <Box flex spread acenter>
        <SelectAssetButton size="small">
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
        </SelectAssetButton>
        <AssetInput
          value={value}
          name="amount"
          label={t("selectAsset.input.label")}
          onChange={onChange}
          width={368}
          dollars="1234 USD"
          unit={p.currency.short}
        />
      </Box>
    </AssetWrapper>
  )
}
