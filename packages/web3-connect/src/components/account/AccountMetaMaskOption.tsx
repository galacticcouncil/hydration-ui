import { Box } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import {
  AccountOption,
  AccountOptionProps,
} from "@/components/account/AccountOption"
import { SChangeAccountButton } from "@/components/account/AccountOption.styled"
import { isEip1193Provider, requestAccounts } from "@/utils"
import { getWallet, MetaMask } from "@/wallets"

export const AccountMetaMaskOption: React.FC<AccountOptionProps> = (props) => {
  const { t } = useTranslation()
  const wallet = getWallet(props.provider)

  // Only MetaMask seems to support switching accounts
  const metaMaskExtension =
    wallet instanceof MetaMask && isEip1193Provider(wallet.extension)
      ? wallet.extension
      : undefined

  return (
    <Box>
      <AccountOption
        {...props}
        sx={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
      />
      {metaMaskExtension && (
        <SChangeAccountButton
          onClick={() => requestAccounts(metaMaskExtension)}
          isActive={props.isActive}
          variant="muted"
          size="small"
        >
          {t("account.changeAccount")}
        </SChangeAccountButton>
      )}
    </Box>
  )
}
