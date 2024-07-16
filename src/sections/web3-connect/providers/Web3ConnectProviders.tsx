import { Text } from "components/Typography/Text/Text"
import { useShallow } from "hooks/useShallow"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import {
  WalletProvider,
  WalletProviderType,
  getSupportedWallets,
} from "sections/web3-connect/Web3Connect.utils"
import {
  ALTERNATIVE_PROVIDERS,
  DESKTOP_PROVIDERS,
  EVM_PROVIDERS,
  MOBILE_PROVIDERS,
  SUBSTRATE_PROVIDERS,
} from "sections/web3-connect/constants/providers"
import {
  Web3ConnectAltProviderButton,
  Web3ConnectProviderButton,
} from "sections/web3-connect/providers/Web3ConnectProviderButton"
import {
  WalletMode,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { POLKADOT_CAIP_ID_MAP } from "sections/web3-connect/wallets/WalletConnect"
import { theme } from "theme"
import { SProviderContainer } from "./Web3ConnectProviders.styled"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import ChevronDownIcon from "assets/icons/ChevronDown.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { Chip } from "components/Chip"
import { Separator } from "components/Separator/Separator"
import { AccordionAnimation } from "components/Accordion/Accordion"

const walletModeIconMap = {
  [WalletMode.Substrate]: <AssetLogo id="5" chainHidden />,
  [WalletMode.EVM]: <AssetLogo id="20" chainHidden />,
}

const useWalletProviders = (mode: WalletMode, chain?: string) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return useMemo(() => {
    const wallets = getSupportedWallets()

    const isDefaultMode = mode === "default"
    const isEvmMode = mode === "evm"
    const isSubstrateMode = mode === "substrate"

    const filteredProviders = wallets
      .filter((provider) => {
        if (isEvmMode) return EVM_PROVIDERS.includes(provider.type)
        const byScreen = isDesktop
          ? DESKTOP_PROVIDERS.includes(provider.type)
          : MOBILE_PROVIDERS.includes(provider.type)

        const isEvmProvider = EVM_PROVIDERS.includes(provider.type)
        const isSubstrateProvider = SUBSTRATE_PROVIDERS.includes(provider.type)

        const byMode =
          isDefaultMode ||
          (isEvmMode && isEvmProvider) ||
          (isSubstrateMode && isSubstrateProvider)

        const byWalletConnect =
          isSubstrateMode && provider.type === "walletconnect" && chain
            ? !!POLKADOT_CAIP_ID_MAP[chain]
            : true

        return byScreen && byMode && byWalletConnect
      })
      .sort((a, b) => {
        const order = Object.values(WalletProviderType)
        return order.indexOf(a.type) - order.indexOf(b.type)
      })

    const alternativeProviders = wallets.filter((provider) =>
      ALTERNATIVE_PROVIDERS.includes(provider.type),
    )

    const { installedProviders, otherProviders } = filteredProviders.reduce<{
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

    return {
      installedProviders,
      otherProviders,
      alternativeProviders,
    }
  }, [isDesktop, mode, chain])
}

export const Web3ConnectProviders = () => {
  const { t } = useTranslation()

  const mode = useWeb3ConnectStore(useShallow((state) => state.mode))
  const meta = useWeb3ConnectStore(useShallow((state) => state.meta))

  const isDefaultMode = mode === "default"

  const [selectedFilter, setSelectedFilter] = useState<WalletMode>(
    isDefaultMode ? WalletMode.Substrate : mode,
  )

  const { installedProviders, otherProviders, alternativeProviders } =
    useWalletProviders(selectedFilter, meta?.chain)

  const installedCountWithoutWC = installedProviders.filter(
    ({ type }) => type !== WalletProviderType.WalletConnect,
  ).length

  const [expanded, setExpanded] = useState(installedCountWithoutWC === 0)

  const modes = [WalletMode.Substrate, WalletMode.EVM] as const

  return (
    <>
      {isDefaultMode && (
        <>
          <div sx={{ flex: "row", align: "center", gap: 10, flexWrap: "wrap" }}>
            <Text color="basic500" fs={14}>
              {t("walletConnect.provider.mode.title")}:
            </Text>
            <div sx={{ flex: "row", align: "center", gap: 10 }}>
              {modes.map((mode) => (
                <Chip
                  key={mode}
                  active={selectedFilter === mode}
                  onClick={() => setSelectedFilter(mode)}
                >
                  <Icon
                    size={20}
                    sx={{ ml: -4 }}
                    icon={walletModeIconMap[mode]}
                  />
                  {t(`walletConnect.provider.mode.${mode}`)}
                </Chip>
              ))}
            </div>
            <div sx={{ display: ["none", "block"], ml: "auto" }}>
              {alternativeProviders.map((provider) => (
                <Web3ConnectAltProviderButton {...provider} key={provider.type}>
                  {t("walletConnect.accountSelect.viewAsWallet")}
                </Web3ConnectAltProviderButton>
              ))}
            </div>
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
      <SProviderContainer>
        {installedProviders.map((provider) => (
          <Web3ConnectProviderButton {...provider} key={provider.type} />
        ))}
      </SProviderContainer>
      <div sx={{ display: ["block", "none"], mt: 20 }}>
        {alternativeProviders.map((provider) => (
          <Web3ConnectAltProviderButton {...provider} key={provider.type}>
            {t("walletConnect.accountSelect.viewAsWallet")}
          </Web3ConnectAltProviderButton>
        ))}
      </div>
      {otherProviders.length > 0 && (
        <>
          <Separator sx={{ my: 20 }} color="darkBlue401" />
          <ButtonTransparent
            onClick={() => setExpanded((state) => !state)}
            sx={{ flex: "row", justify: "space-between" }}
          >
            <Text color="basic400">
              {t("walletConnect.provider.section.other")}
            </Text>
            <div sx={{ flex: "row", align: "center" }}>
              <Text fs={13} color="basic400">
                {t(expanded ? "hide" : "show")}
              </Text>
              <div
                css={{
                  transform: expanded ? "rotate(180deg)" : undefined,
                  transition: theme.transitions.default,
                }}
              >
                <Icon icon={<ChevronDownIcon />} sx={{ color: "basic400" }} />
              </div>
            </div>
          </ButtonTransparent>
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
