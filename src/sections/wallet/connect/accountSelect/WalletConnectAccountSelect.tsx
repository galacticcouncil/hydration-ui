import { css } from "styled-components"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { ProviderType } from "sections/wallet/connect/modal/WalletConnectModal.utils"
import { Box } from "components/Box/Box"
import { web3Accounts } from "@polkadot/extension-dapp"
import { useQuery } from "@tanstack/react-query"
import { WalletConnectAccountSelectItem } from "sections/wallet/connect/accountSelect/item/WalletConnectAccountSelectItem"

export function WalletConnectAccountSelect(props: { provider: ProviderType }) {
  const { t } = useTranslation("translation")
  const accounts = useQuery(["web3Accounts", props.provider], () => {
    return web3Accounts({ extensions: [props.provider] })
  })

  return (
    <>
      <Text fw={400} mt={6} color="neutralGray200">
        {t("walletConnectModal.accountSelect.description")}
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
          <WalletConnectAccountSelectItem
            key={account.address}
            name={account.meta.name ?? account.address}
            address={account.address}
          />
        ))}
      </Box>
    </>
  )
}
