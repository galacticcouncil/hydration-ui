import { Alert, TextButton } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { WalletProviderType } from "@/config/providers"
import { getWallet } from "@/wallets"

type ProviderUnavailableProps = {
  provider: WalletProviderType
  hasRetried: boolean
  onRetry: (provider: WalletProviderType) => void
}

export const ProviderUnavailable: FC<ProviderUnavailableProps> = ({
  provider,
  hasRetried,
  onRetry,
}) => {
  const { t } = useTranslation()
  const wallet = getWallet(provider)

  // AppKit can't recover from a hung `ready()`, so a second timeout needs a reload.
  if (provider === WalletProviderType.WalletConnect && hasRetried) {
    return (
      <Alert
        variant="warning"
        description={t("provider.walletConnectUnavailable")}
      />
    )
  }

  return (
    <Alert
      variant="warning"
      description={t("provider.notResponding", {
        name: wallet?.title ?? provider,
      })}
      action={
        <TextButton variant="underline" onClick={() => onRetry(provider)}>
          {t("error.retry")}
        </TextButton>
      }
    />
  )
}
