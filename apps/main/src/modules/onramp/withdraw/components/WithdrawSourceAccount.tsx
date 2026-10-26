import { WalletIcon } from "@galacticcouncil/ui/assets/icons"
import { Button, Icon, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Account } from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SDepositSourceAccount } from "@/modules/onramp/deposit/preview/steps/DepositHydrationTransfer.styled"

type WithdrawSourceAccountProps = {
  account: Account | null
  onChange: () => void
  disabled?: boolean
}

export const WithdrawSourceAccount: FC<WithdrawSourceAccountProps> = ({
  account,
  onChange,
  disabled,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const wallet = account && getWallet(account.provider)
  return (
    <Stack
      gap="base"
      justify="flex-start"
      data-onramp-step="withdraw-source-account"
    >
      <Text fs="p5" color={getToken("text.medium")}>
        {t("withdraw.onchain.wallet.source")}
      </Text>
      {account ? (
        <SDepositSourceAccount
          name={`${wallet?.title ?? ""} · ${account.name}`}
          address={account.displayAddress}
          walletLogoSrc={wallet?.logo}
          width="100%"
          action={
            <Button
              variant="secondary"
              outline
              size="micro"
              uppercase
              disabled={disabled}
              sx={{ py: "base", px: "m" }}
              onClick={onChange}
            >
              {t("common:change")}
            </Button>
          }
        />
      ) : (
        <Button
          variant="tertiary"
          width="100%"
          disabled={disabled}
          onClick={onChange}
        >
          <Icon component={WalletIcon} size="m" />
          {t("common:connectWallet")}
        </Button>
      )}
    </Stack>
  )
}
