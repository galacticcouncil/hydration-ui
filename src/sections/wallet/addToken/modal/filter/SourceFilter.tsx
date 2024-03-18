import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { ChainLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { SContainer, SFilterButton } from "./SourceFilter.styled"
import { SELECTABLE_PARACHAINS_IDS } from "sections/wallet/addToken/AddToken.utils"

const chains = Array.from(chainsMap.values()).filter(
  ({ parachainId, ecosystem }) =>
    SELECTABLE_PARACHAINS_IDS.includes(parachainId.toString()) &&
    ecosystem === "polkadot",
)

type Props = {
  className?: string
  value?: string
  onChange?: (parachainId: string) => void
}

export const SourceFilter: FC<Props> = ({ className, value, onChange }) => {
  const { t } = useTranslation()

  return (
    <SContainer className={className}>
      <Text color="basic500" fs={12} tTransform="uppercase">
        {t("wallet.addToken.filter.source")}
      </Text>
      {chains.map(({ key, name, parachainId }) => (
        <SFilterButton
          active={parachainId.toString() === value}
          key={key}
          onClick={() => onChange?.(parachainId.toString())}
        >
          <Icon sx={{ ml: -4 }} icon={<ChainLogo symbol={key} />} size={20} />
          {name}
        </SFilterButton>
      ))}
      <SFilterButton disabled>
        {t("wallet.addToken.filter.comingSoon")}
      </SFilterButton>
    </SContainer>
  )
}
