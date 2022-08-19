import { css } from "styled-components/macro"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { ProviderType } from "../WalletConnectModal.utils"
import { Box } from "components/Box/Box"
import { web3Accounts } from "@polkadot/extension-dapp"
import { useQuery } from "@tanstack/react-query"
import { WalletAccountItem } from "pages/WalletConnectModal/WalletAccountSelectSection/WalletAccountItem"

export function WalletAccountSelectSection(props: { provider: ProviderType }) {
  const { t } = useTranslation("translation")
  const accounts = useQuery(["web3Accounts", props.provider], () => {
    return web3Accounts({ extensions: [props.provider] })
  })

  return (
    <>
      <Text fw={400} mt={6} color="neutralGray200">
        {t("walletConnectModal.account.description")}
      </Text>

      <Box
        flex
        column
        gap={10}
        mt={10}
        css={css`
          overflow-x: hidden;
          overflow-y: auto;
          max-height: 450px;
        `}
      >
        {accounts.data?.map((account) => (
          <WalletAccountItem
            key={account.address}
            name={account.meta.name ?? account.address}
            address={account.address}
          />
        ))}
      </Box>
    </>
  )
}
