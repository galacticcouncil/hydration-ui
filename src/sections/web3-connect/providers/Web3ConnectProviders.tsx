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
import { Web3ConnectProviderButton } from "sections/web3-connect/providers/Web3ConnectProviderButton"
import {
  WalletMode,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { POLKADOT_CAIP_ID_MAP } from "sections/web3-connect/wallets/WalletConnect"
import { theme } from "theme"
import { SProviderContainer } from "./Web3ConnectProviders.styled"
import { SFilterButton } from "sections/wallet/addToken/modal/filter/SourceFilter.styled"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import ChevronDownIcon from "assets/icons/ChevronDown.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  m as motion,
} from "framer-motion"
import ChevronRight from "assets/icons/ChevronRight.svg?react"

const useWalletProviders = (mode: WalletMode, chain?: string) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return useMemo(() => {
    const wallets = getSupportedWallets()

    const isDefaultMode = mode === "default"
    const isEvmMode = mode === "evm"
    const isSubstrateMode = mode === "substrate"

    const defaultProviders = wallets
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

    const alternativeProviders = wallets.filter((provider) => {
      return ALTERNATIVE_PROVIDERS.includes(provider.type)
    })

    const { installed, notInstalled } = defaultProviders.reduce<{
      installed: WalletProvider[]
      notInstalled: WalletProvider[]
    }>(
      (prev, curr) => {
        if (curr.wallet.installed) {
          prev.installed.push(curr)
        } else {
          prev.notInstalled.push(curr)
        }
        return prev
      },
      {
        installed: [],
        notInstalled: [],
      },
    )

    return {
      installed,
      notInstalled,
      defaultProviders,
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

  const { installed, notInstalled, alternativeProviders } = useWalletProviders(
    selectedFilter,
    meta?.chain,
  )

  const installedCountWithoutWC = installed.filter(
    ({ type }) => type !== WalletProviderType.WalletConnect,
  ).length

  const [expanded, setExpanded] = useState(installedCountWithoutWC === 0)

  return (
    <>
      {isDefaultMode && (
        <div sx={{ flex: "row", align: "center", gap: 4, mb: 20 }}>
          <>
            <Text color="basic500" fs={14}>
              Mode:
            </Text>
            <div sx={{ flex: "row", align: "center", gap: 4 }}>
              <SFilterButton
                active={selectedFilter === WalletMode.Substrate}
                onClick={() => setSelectedFilter(WalletMode.Substrate)}
              >
                <Icon
                  size={20}
                  sx={{ ml: -4 }}
                  icon={<AssetLogo id="5" chainHidden />}
                />{" "}
                Polkadot
              </SFilterButton>
              <SFilterButton
                active={selectedFilter === WalletMode.EVM}
                onClick={() => setSelectedFilter(WalletMode.EVM)}
              >
                <Icon
                  size={20}
                  sx={{ ml: -4 }}
                  icon={<AssetLogo id="20" chainHidden />}
                />{" "}
                EVM
              </SFilterButton>
            </div>
            {alternativeProviders.map((provider) => (
              <Web3ConnectProviderButton {...provider} key={provider.type}>
                {(props) => (
                  <ButtonTransparent
                    {...props}
                    sx={{
                      ml: "auto",
                      flex: "row",
                      align: "center",
                      color: "basic400",
                    }}
                  >
                    <img
                      src={provider.wallet.logo.src}
                      alt={provider.wallet.logo.alt}
                      width={24}
                      height={24}
                      sx={{ mr: 4 }}
                    />
                    <Text fs={14} color="basic400">
                      {t("walletConnect.accountSelect.viewAsWallet")}
                    </Text>
                    <ChevronRight width={18} height={18} />
                  </ButtonTransparent>
                )}
              </Web3ConnectProviderButton>
            ))}
          </>
        </div>
      )}

      <Text color="basic400">Installed & recently used</Text>
      <SProviderContainer>
        {installed.map((provider) => (
          <Web3ConnectProviderButton {...provider} key={provider.type} />
        ))}
      </SProviderContainer>
      <ButtonTransparent
        onClick={() => setExpanded((state) => !state)}
        sx={{ flex: "row", justify: "space-between", mt: 20 }}
      >
        <Text color="basic400">Other wallets</Text>
        <div sx={{ flex: "row", align: "center" }}>
          <Text fs={13} color="darkBlue300">
            {t(expanded ? "hide" : "show")}
          </Text>
          <div
            css={{
              color: theme.colors.iconGray,
              transform: expanded ? "rotate(180deg)" : undefined,
              transition: theme.transitions.default,
            }}
          >
            <Icon icon={<ChevronDownIcon />} sx={{ color: "darkBlue300" }} />
          </div>
        </div>
      </ButtonTransparent>
      <LazyMotion features={domAnimation}>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              css={{ overflow: "hidden" }}
            >
              <SProviderContainer>
                {notInstalled.map((provider) => (
                  <Web3ConnectProviderButton
                    {...provider}
                    key={provider.type}
                  />
                ))}
              </SProviderContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </LazyMotion>
    </>
  )
}
