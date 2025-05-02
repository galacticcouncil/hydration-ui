import { ChainSelect, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { ChainEcosystem } from "@galacticcouncil/xcm-core"
import { useTranslation } from "react-i18next"

import { SELECTABLE_PARACHAINS_IDS } from "@/modules/wallet/assets/AddToken/AddToken.utils"
import { isAnyParachain } from "@/utils/externalAssets"

type Props = {
  readonly className?: string
  readonly parachainId: number
  readonly onChange: (parachainId: number) => void
}

export const AddTokenSource = ({ parachainId, onChange, className }: Props) => {
  const { t } = useTranslation(["wallet", "common"])

  return (
    <Flex gap={10} align="center" className={className}>
      <Text
        fs={12}
        sx={{ textTransform: "uppercase" }}
        color={getToken("text.medium")}
      >
        {t("common:source")}:
      </Text>
      <Flex gap={10} sx={{ overflowX: "auto" }}>
        {chains.map((chain) => (
          <ChainSelect
            key={chain.key}
            value={chain.parachainId}
            isActive={parachainId === chain.parachainId}
            onClick={() => onChange(chain.parachainId)}
          >
            {/* TODO chain image */}
            {chain.name}
          </ChainSelect>
        ))}
        <ChainSelect disabled>{t("addToken.modal.moreSoon")}</ChainSelect>
      </Flex>
    </Flex>
  )
}

const chains = Array.from(chainsMap.values())
  .filter(isAnyParachain)
  .filter(
    (chain) =>
      SELECTABLE_PARACHAINS_IDS.includes(chain.parachainId) &&
      chain.ecosystem === ChainEcosystem.Polkadot,
  )
