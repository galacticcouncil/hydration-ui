import { Search } from "@galacticcouncil/ui/assets/icons"
import { Flex, Input } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { ModalMenu } from "@/components"
import { ChainAssetsList } from "@/modules/wallet/assets/Withdraw/on-chain/ChainAssetsList"

const chainTypes = ["Polkadot", "EVM", "Solana"] as const
export type ChainType = (typeof chainTypes)[number]

type Props = {
  readonly onSelect: () => void
}

export const ChainAssets: FC<Props> = ({ onSelect }) => {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")

  const [types, setTypes] = useState<ReadonlyArray<ChainType>>(["Polkadot"])

  return (
    <Flex direction="column" gap={getTokenPx("containers.paddings.tertiary")}>
      <Input
        iconStart={Search}
        placeholder={t("assetSelector.input.placeholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ModalMenu
        activeKeys={types}
        allItem
        items={chainTypes.map((type) => ({
          key: type,
          title: type,
        }))}
        onActivate={(keys) => setTypes(keys)}
      />
      <ChainAssetsList search={search} onSelect={onSelect} />
    </Flex>
  )
}
