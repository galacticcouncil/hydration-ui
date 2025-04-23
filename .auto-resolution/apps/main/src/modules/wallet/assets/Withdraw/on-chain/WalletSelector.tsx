import { SearchIcon } from "@galacticcouncil/ui/assets/icons"
import { Chain, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly selectedWallet: string
  readonly onSelect: (wallet: string) => void
}

export const wallets = ["PolkadotJS", "Subwallet", "Walletconnect"] as const

export const WalletSelector: FC<Props> = ({ selectedWallet, onSelect }) => {
  const { t } = useTranslation("wallet")

  return (
    <Flex direction="column" gap={4}>
      <Flex direction="column" gap={10}>
        <Text fw={500} fs={14} lh={px(18)} color={getToken("text.low")}>
          {t("withdraw.selectAccount.wallets")}
        </Text>
        {/* TODO all wallets */}
      </Flex>
      <Flex direction="column" gap={4}>
        {wallets.map((wallet) => (
          <Chain
            key={wallet}
            icon={SearchIcon}
            name={wallet}
            onClick={() => onSelect(wallet)}
            isActive={wallet === selectedWallet}
          />
        ))}
      </Flex>
    </Flex>
  )
}
