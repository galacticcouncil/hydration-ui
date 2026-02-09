import { isAndroid } from "@galacticcouncil/utils"

import {
  ProviderButton,
  ProviderButtonOwnProps,
} from "@/components/provider/ProviderButton"
import { WALLET_DEEPLINKS } from "@/config/deeplinks"

export const ProviderDeeplinkedButton: React.FC<ProviderButtonOwnProps> = ({
  walletData,
  ...props
}) => {
  const { provider } = walletData
  const deeplinkConfig = provider ? WALLET_DEEPLINKS[provider] : undefined

  if (!deeplinkConfig) return null

  const href =
    deeplinkConfig.android && isAndroid()
      ? deeplinkConfig.android
      : deeplinkConfig.universal
  return (
    <ProviderButton
      as="a"
      href={href}
      walletData={walletData}
      actionLabel="Open"
      {...props}
    />
  )
}
