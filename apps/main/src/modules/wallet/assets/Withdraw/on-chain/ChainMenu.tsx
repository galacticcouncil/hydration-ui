import { Search } from "@galacticcouncil/ui/assets/icons"
import { Flex, Input, Text } from "@galacticcouncil/ui/components"
import { ChainSelect } from "@galacticcouncil/ui/components/ChainSelect"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC, useState } from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetWithdrawFormValues } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawForm.utils"

const withdrawChains = ["Hydration", "Acala", "Astar", "Centrifuge"] as const
export type WithdrawChain = (typeof withdrawChains)[number]

export const ChainMenu: FC = () => {
  const { t } = useTranslation(["wallet", "common"])
  const [search, setSearch] = useState("")

  const filteredChains = withdrawChains.filter((chain) =>
    chain.toLowerCase().includes(search.toLowerCase()),
  )

  const { control } = useFormContext<AssetWithdrawFormValues>()
  const { field } = useController({ control, name: "chain" })

  return (
    <Flex direction="column" gap={10}>
      <Input
        iconStart={Search}
        placeholder={t("common:chain")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Text fw={500} fs={14} lh={px(18)} color={getToken("text.low")}>
        {t("withdraw.onChain.chains")}
      </Text>
      <Flex direction="column" gap={4}>
        {filteredChains.map((withdrawChain) => (
          <ChainSelect
            key={withdrawChain}
            isActive={withdrawChain === field.value}
            onClick={() => field.onChange(withdrawChain)}
          >
            {/* TODO chain icon */}
            <svg width={18} height={18} />
            {withdrawChain}
          </ChainSelect>
        ))}
      </Flex>
    </Flex>
  )
}
