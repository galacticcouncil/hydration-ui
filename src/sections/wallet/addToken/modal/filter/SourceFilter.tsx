import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { ChainLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { SContainer } from "./SourceFilter.styled"
import { SELECTABLE_PARACHAINS_IDS } from "sections/wallet/addToken/AddToken.utils"
import { isAnyParachain } from "utils/helpers"
import { AnyParachain, ChainEcosystem } from "@galacticcouncil/xcm-core"
import { Chip } from "components/Chip"

const chains = Array.from(chainsMap.values()).filter(
  (chain) =>
    isAnyParachain(chain) &&
    !chain.isTestChain &&
    SELECTABLE_PARACHAINS_IDS.includes(chain.parachainId) &&
    chain.ecosystem === ChainEcosystem.Polkadot,
) as AnyParachain[]

type Props = {
  className?: string
  value?: number
  onChange?: (parachainId: number) => void
}

export const SourceFilter: FC<Props> = ({ className, value, onChange }) => {
  const { t } = useTranslation()

  return (
    <SContainer className={className}>
      <Text color="basic500" fs={12} tTransform="uppercase">
        {t("wallet.addToken.filter.source")}
      </Text>
      {chains.map(({ key, name, parachainId }) => (
        <Chip
          active={parachainId === value}
          key={key}
          onClick={() => onChange?.(parachainId)}
        >
          <Icon
            sx={{ ml: -4 }}
            icon={<ChainLogo id={parachainId} />}
            size={20}
          />
          {name}
        </Chip>
      ))}
      <Chip disabled>{t("wallet.addToken.filter.comingSoon")}</Chip>
    </SContainer>
  )
}
