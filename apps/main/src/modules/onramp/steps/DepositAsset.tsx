import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Button,
  Flex,
  Icon,
  ModalBody,
  ModalHeader,
  Spinner,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { isH160Address } from "@galacticcouncil/utils"
import {
  useAccount,
  useWeb3ConnectModal,
  Web3ConnectButton,
} from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AssetAmount } from "@galacticcouncil/xc-core"
import React, { useCallback, useEffect, useRef } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useCustomCompareEffect, usePrevious } from "react-use"
import { isBigInt } from "remeda"

import {
  useCrossChainBalance,
  useCrossChainBalanceSubscription,
} from "@/api/xcm"
import { AssetLogo } from "@/components/AssetLogo/AssetLogo"
import { AccountBox } from "@/modules/onramp/components/AccountBox"
import { CexDepositGuide } from "@/modules/onramp/components/CexDepositGuide"
import { CEX_CONFIG, CEX_DEPOSIT_LIMITS } from "@/modules/onramp/config/cex"
import { useDeposit } from "@/modules/onramp/hooks/useDeposit"
import { AssetConfig } from "@/modules/onramp/types"
import { useAssets } from "@/providers/assetsProvider"

export type DepositAssetProps = {
  onDepositSuccess: (asset: AssetConfig) => void
  onBack: () => void
}

export const DepositAsset: React.FC<DepositAssetProps> = ({
  onDepositSuccess,
  onBack,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { account } = useAccount()
  const { toggle: toggleWeb3Modal } = useWeb3ConnectModal()
  const { getAsset } = useAssets()

  const {
    asset,
    cexId,
    currentDeposit,
    setAmount: setDepositedAmount,
    setCurrentDeposit,
  } = useDeposit()

  const activeCex = CEX_CONFIG.find((cex) => cex.id === cexId)

  const address = account?.address ?? ""
  const dstChain = asset?.depositChain ?? ""
  const assetKey = asset?.data.asset.key

  const balanceSnapshot = useRef<bigint | null>(null)

  const prevAddress = usePrevious(address)

  useEffect(() => {
    if (prevAddress && prevAddress !== address) {
      balanceSnapshot.current = null
    }
  }, [address, prevAddress])

  const setBalanceSnapshot = useCallback(
    (balances: AssetAmount[]) => {
      const balance = balances?.find((a) => a.key === assetKey)?.amount ?? null
      if (balanceSnapshot.current === null && balance !== null) {
        balanceSnapshot.current = balance
        if (asset) {
          setCurrentDeposit({
            cexId,
            asset,
            address,
            amount: "",
            balanceSnapshot: balance.toString(),
          })
        }
      }
    },
    [address, asset, assetKey, cexId, setCurrentDeposit],
  )

  useCrossChainBalanceSubscription(address, dstChain, setBalanceSnapshot)

  const { data: balances } = useCrossChainBalance(address, dstChain)

  const balance = balances?.get(asset?.data.asset.key ?? "")?.amount

  useCustomCompareEffect(
    () => {
      console.log({ balance, currentSnapshow: balanceSnapshot.current })

      if (!asset || !isBigInt(balance) || !isBigInt(balanceSnapshot.current)) {
        return
      }
      if (balance > balanceSnapshot.current) {
        const amount = balance - balanceSnapshot.current
        onDepositSuccess(asset)
        setDepositedAmount(amount.toString())
        if (currentDeposit)
          setCurrentDeposit({ ...currentDeposit, amount: amount.toString() })
      }
    },
    [balance],
    (_, next) => {
      if (!balanceSnapshot.current) return false
      const nextBalance = next[0] ?? 0n
      return nextBalance > balanceSnapshot.current
    },
  )

  const chain = chainsMap.get(dstChain)

  const isAccountAllowed = isH160Address(address)
    ? (chain?.isEvmParachain() ?? false)
    : true

  const assetDetails = asset ? getAsset(asset.assetId) : null

  const minDeposit = asset ? (CEX_DEPOSIT_LIMITS[asset.assetId] ?? 0) : 0

  const getAddressPrefix = (chainKey: string) => {
    // Get SS58 format - keep old hydration prefix for CEX compatibility
    if (chainKey === "hydration") {
      return 63
    }
    return 0
  }

  if (!activeCex) return null

  return (
    <>
      <ModalHeader
        title={t("deposit.cex.asset.title")}
        align="center"
        onBack={onBack}
        closable={false}
      />
      <ModalBody>
        <Stack gap={12}>
          <Text
            fs={12}
            lh={1.4}
            color={getToken("text.medium")}
            sx={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <Trans
              t={t}
              i18nKey="onramp:deposit.cex.asset.select.label"
              values={{ name: activeCex.title }}
            >
              <Icon size={14} component={activeCex.logo} />
              <Text as="span" color={getToken("text.high")} />
            </Trans>
          </Text>

          <Button
            onClick={onBack}
            variant="tertiary"
            outline
            size="medium"
            sx={{
              pl: 8,
              py: 8,
              flex: 1,
              justifyContent: "space-between",
              width: "100%",
              backgroundColor: "transparent",
            }}
          >
            {asset ? (
              <Flex align="center" gap={4}>
                <AssetLogo id={asset.assetId} />
                <Text fs={14} fw={600} color={getToken("text.high")} ml={4}>
                  {asset.data.asset.originSymbol}
                </Text>
              </Flex>
            ) : (
              t("onramp:selectAsset")
            )}
            <Icon component={ChevronDown} size={16} sx={{ ml: "auto" }} />
          </Button>

          {!account && (
            <Web3ConnectButton size="medium" variant="secondary" width="100%" />
          )}

          {account && assetDetails && (
            <>
              <AccountBox
                {...account}
                ss58Format={getAddressPrefix(dstChain)}
                error={
                  !isAccountAllowed
                    ? t("deposit.cex.account.evmError", {
                        symbol: asset?.data.asset.originSymbol,
                      })
                    : undefined
                }
                cexId={cexId}
                asset={asset}
                onToggleWeb3Modal={() => toggleWeb3Modal()}
              />

              {isAccountAllowed && asset && minDeposit > 0 && (
                <Flex justify="space-between" align="center">
                  <Text fs="p5" color={getToken("text.medium")}>
                    {t("deposit.cex.amount.min.title")}:
                  </Text>
                  <Text fs="p5">
                    {minDeposit} {asset.data.asset.originSymbol}
                  </Text>
                </Flex>
              )}

              {isAccountAllowed && (
                <>
                  <Flex justify="center">
                    <Button
                      variant="muted"
                      as="div"
                      sx={{ pointerEvents: "none" }}
                    >
                      <Icon component={Spinner} size={16} ml={-4} />
                      <Text fs={12} lh={1} fw={600} transform="uppercase">
                        {t("deposit.cex.awaiting.title")}
                      </Text>
                    </Button>
                  </Flex>
                  <Alert
                    variant="info"
                    description={t("deposit.cex.asset.alert")}
                  />
                </>
              )}
            </>
          )}
        </Stack>
      </ModalBody>
      <ModalBody noPadding>
        <CexDepositGuide cexId={cexId} />
      </ModalBody>
    </>
  )
}
