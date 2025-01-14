import { Text } from "components/Typography/Text/Text"
import { useShallow } from "hooks/useShallow"
import React, { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import {
  WalletProvider,
  WalletProviderType,
  getSupportedWallets,
  useConnectedProviders,
} from "sections/web3-connect/Web3Connect.utils"
import {
  ALTERNATIVE_PROVIDERS,
  DESKTOP_ONLY_PROVIDERS,
  EVM_PROVIDERS,
  HIDDEN_PROVIDERS,
  MOBILE_ONLY_PROVIDERS,
  SOLANA_PROVIDERS,
  SUBSTRATE_H160_PROVIDERS,
  SUBSTRATE_PROVIDERS,
} from "sections/web3-connect/constants/providers"
import { Web3ConnectProviderButton } from "sections/web3-connect/providers/Web3ConnectProviderButton"
import {
  WalletMode,
  WalletProviderStatus,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { POLKADOT_CAIP_ID_MAP } from "sections/web3-connect/wallets/WalletConnect"
import { theme } from "theme"
import {
  SExpandButton,
  SProviderButton,
  SProviderContainer,
} from "./Web3ConnectProviders.styled"
import { Icon } from "components/Icon/Icon"
import ChevronDownIcon from "assets/icons/ChevronDown.svg?react"
import { Separator } from "components/Separator/Separator"
import { AccordionAnimation } from "components/Accordion/Accordion"
import { pick } from "utils/rx"
import { Web3ConnectProviderIcons } from "sections/web3-connect/providers/Web3ConnectProviderIcons"
import { Web3ConnectModeFilter } from "sections/web3-connect/modal/Web3ConnectModeFilter"
import { POLKADOT_APP_NAME } from "utils/api"
import ChevronRight from "assets/icons/ChevronRight.svg?react"

const useWalletProviders = (mode: WalletMode, chain?: string) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const connectedProviders = useConnectedProviders()

  return useMemo(() => {
    const wallets = getSupportedWallets()

    const connectedProviderTypes = connectedProviders.map(({ type }) => type)

    const isDefaultMode = mode === WalletMode.Default
    const isEvmMode = mode === WalletMode.EVM
    const isSolanaMode = mode === WalletMode.Solana
    const isSubstrateMode = mode === WalletMode.Substrate
    const isSubstrateEvmMode = mode === WalletMode.SubstrateEVM
    const isSubstrateH160Mode = mode === WalletMode.SubstrateH160

    const filteredProviders = wallets
      .filter((provider) => {
        const byScreen = isDesktop
          ? !MOBILE_ONLY_PROVIDERS.includes(provider.type)
          : !DESKTOP_ONLY_PROVIDERS.includes(provider.type)

        const isAlternativeProvider = ALTERNATIVE_PROVIDERS.includes(
          provider.type,
        )
        const isEvmProvider =
          EVM_PROVIDERS.includes(provider.type) || isAlternativeProvider

        const isSubstrateProvider =
          SUBSTRATE_PROVIDERS.includes(provider.type) || isAlternativeProvider

        const isSubstrateH160Provider = SUBSTRATE_H160_PROVIDERS.includes(
          provider.type,
        )

        const isSolanaProvider = SOLANA_PROVIDERS.includes(provider.type)

        // hide specific providers that are not connected
        const byDefaultModeVisibility =
          isDefaultMode && HIDDEN_PROVIDERS.includes(provider.type)
            ? connectedProviderTypes.includes(provider.type)
            : true

        const byMode =
          isDefaultMode ||
          isSubstrateEvmMode ||
          (isEvmMode && isEvmProvider) ||
          (isSubstrateMode && isSubstrateProvider) ||
          (isSubstrateH160Mode && isSubstrateH160Provider) ||
          (isSolanaMode && isSolanaProvider)

        const byWalletConnect =
          isSubstrateMode && provider.type === "walletconnect" && chain
            ? !!POLKADOT_CAIP_ID_MAP[chain]
            : true

        return byScreen && byMode && byWalletConnect && byDefaultModeVisibility
      })
      .sort((a, b) => {
        const order = Object.values(WalletProviderType)
        return order.indexOf(a.type) - order.indexOf(b.type)
      })

    return filteredProviders.reduce<{
      installedProviders: WalletProvider[]
      otherProviders: WalletProvider[]
    }>(
      (prev, curr) => {
        if (curr.wallet.installed) {
          prev.installedProviders.push(curr)
        } else {
          prev.otherProviders.push(curr)
        }
        return prev
      },
      {
        installedProviders: [],
        otherProviders: [],
      },
    )
  }, [mode, isDesktop, connectedProviders, chain])
}

type Web3ConnectProvidersProps = {
  onAccountSelect: () => void
}

export const Web3ConnectProviders: React.FC<Web3ConnectProvidersProps> = ({
  onAccountSelect,
}) => {
  const { t } = useTranslation()

  const { mode, meta, setStatus } = useWeb3ConnectStore(
    useShallow((state) => pick(state, ["mode", "meta", "setStatus"])),
  )

  const providers = useConnectedProviders()

  const isDefaultMode = mode === WalletMode.Default

  const [modeFilter, setModeFilter] = useState<WalletMode>(mode)

  const { installedProviders, otherProviders } = useWalletProviders(
    isDefaultMode ? modeFilter : mode,
    meta?.chain,
  )

  const installedExtensions = installedProviders.filter(({ type }) => {
    return (
      !ALTERNATIVE_PROVIDERS.includes(type) && !type.includes("walletconnect")
    )
  })

  const enableAll = useCallback(() => {
    installedExtensions.forEach(({ type, wallet }) => {
      wallet.enable(POLKADOT_APP_NAME)
      setStatus(type, WalletProviderStatus.Connected)
    })
  }, [installedExtensions, setStatus])

  const [expanded, setExpanded] = useState(installedExtensions.length === 0)

  const isSolanaConnected = providers.some(({ type }) =>
    SOLANA_PROVIDERS.includes(type),
  )

  return (
    <>
      {isDefaultMode && (
        <>
          <div sx={{ flex: "row", align: "center", gap: 10, flexWrap: "wrap" }}>
            <Web3ConnectModeFilter
              active={modeFilter}
              onSetActive={(mode) => setModeFilter(mode)}
              blacklist={!isSolanaConnected ? [WalletMode.Solana] : []}
            />
          </div>
          <Separator
            sx={{
              width: "auto",
              mx: "calc(var(--modal-content-padding) * -1)",
              my: 20,
            }}
            color="darkBlue401"
          />
        </>
      )}

      <Text color="basic400">
        {t("walletConnect.provider.section.installed")}
      </Text>
      {installedProviders.length > 0 ? (
        <SProviderContainer>
          {providers.length > 0 && mode === WalletMode.Default && (
            <SProviderButton onClick={onAccountSelect}>
              <Web3ConnectProviderIcons
                providers={providers.map((p) => p.type)}
              />
              <Text fs={[12, 14]} sx={{ mt: 8 }} tAlign="center">
                {t("walletConnect.provider.lastConnected")}
              </Text>
            </SProviderButton>
          )}
          {installedProviders.map((provider) => (
            <Web3ConnectProviderButton key={provider.type} {...provider} />
          ))}
          {installedExtensions.length > 0 && (
            <SProviderButton
              onClick={enableAll}
              css={{ gridColumn: "1 / -1" }}
              sx={{
                display: ["none", "flex"],
                flex: "row",
                justify: "space-between",
                px: [12, 16],
                py: [8, 10],
              }}
            >
              <Text fs={[12, 13]}>
                {t("walletConnect.provider.section.installed.all")}
              </Text>
              <Text
                fs={[12, 13]}
                color="brightBlue300"
                sx={{ flex: "row", align: "center" }}
              >
                {t("walletConnect.provider.connectAll")}{" "}
                <ChevronRight width={20} height={20} sx={{ mr: -4 }} />
              </Text>
            </SProviderButton>
          )}
        </SProviderContainer>
      ) : (
        <Text fs={12} color="basic400" sx={{ mt: 8 }}>
          {t("walletConnect.provider.section.installed.notFound")}
        </Text>
      )}

      {otherProviders.length > 0 && (
        <>
          <Separator sx={{ my: 20 }} color="darkBlue401" />
          <SExpandButton
            aria-expanded={expanded}
            onClick={() => setExpanded((state) => !state)}
          >
            {t("walletConnect.provider.section.other")}
            <div sx={{ flex: "row", align: "center", fontSize: 13 }}>
              {t(expanded ? "hide" : "show")}
              <Icon icon={<ChevronDownIcon />} />
            </div>
          </SExpandButton>
          <AccordionAnimation expanded={expanded}>
            <SProviderContainer>
              {otherProviders.map((provider) => (
                <Web3ConnectProviderButton {...provider} key={provider.type} />
              ))}
            </SProviderContainer>
          </AccordionAnimation>
        </>
      )}
    </>
  )
}
