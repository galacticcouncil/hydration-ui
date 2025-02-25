import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { AssetAmount } from "@galacticcouncil/xcm-core"
import { useCrossChainBalance, useCrossChainBalanceSubscription } from "api/xcm"
import { Alert } from "components/Alert"
import { AssetSelectButton } from "components/AssetSelect/AssetSelectButton"
import { Icon } from "components/Icon/Icon"
import { Separator } from "components/Separator/Separator"
import { Spinner } from "components/Spinner/Spinner"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { useCallback, useEffect, useRef } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useCustomCompareEffect, usePrevious } from "react-use"
import { AccountBox } from "sections/deposit/components/AccountBox"
import { CexDepositGuide } from "sections/deposit/components/CexDepositGuide"
import {
  CEX_CONFIG,
  CEX_DEPOSIT_LIMITS,
  useDeposit,
} from "sections/deposit/DepositPage.utils"
import { SAssetSelectButtonBox } from "sections/deposit/steps/deposit/DepositAsset.styled"
import { AssetConfig } from "sections/deposit/types"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { isEvmAccount } from "utils/evm"
import { isAnyParachain } from "utils/helpers"
import { isBigInt } from "utils/types"

type DepositAssetProps = {
  onAsssetSelect: () => void
  onDepositSuccess: (asset: AssetConfig) => void
}

export const DepositAsset: React.FC<DepositAssetProps> = ({
  onAsssetSelect,
  onDepositSuccess,
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { getAsset } = useAssets()
  const {
    asset,
    cexId,
    currentDeposit,
    setAmount: setDepositedAmount,
    setCurrentDeposit,
  } = useDeposit()

  const activeCex = CEX_CONFIG.find((cex) => cex.id === cexId)
  const CexIcon = activeCex?.icon

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
      if (!isBigInt(balanceSnapshot.current)) {
        balanceSnapshot.current = balance
        if (asset) {
          setCurrentDeposit({
            cexId,
            asset,
            address,
            amount: "",
            balanceSnapshot: balance ? balance.toString() : "0",
          })
        }
      }
    },
    [address, asset, assetKey, cexId, setCurrentDeposit],
  )

  useCrossChainBalanceSubscription(address, dstChain, setBalanceSnapshot)

  const { data: balances } = useCrossChainBalance(address, dstChain)

  const balance = balances?.find((a) => a.key === asset?.data.asset.key)?.amount

  useCustomCompareEffect(
    () => {
      if (!asset) return
      if (!isBigInt(balance)) return
      if (!isBigInt(balanceSnapshot.current)) return
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

  const isAccountAllowed = isEvmAccount(address)
    ? chain?.isEvmParachain() ?? false
    : true

  const assetDetails = asset ? getAsset(asset.assetId) : null

  const minDeposit = asset ? CEX_DEPOSIT_LIMITS[asset.assetId] ?? 0 : 0

  return (
    <div sx={{ flex: "column", gap: 12 }}>
      <SAssetSelectButtonBox>
        <Text
          sx={{ flex: "row", align: "center", gap: 4 }}
          fs={11}
          lh={22}
          tTransform="uppercase"
          color="whiteish500"
        >
          <Trans
            t={t}
            i18nKey="deposit.cex.asset.select.label"
            values={{ name: activeCex?.title }}
          >
            {CexIcon && <Icon size={14} icon={<CexIcon />} />}
            <span sx={{ color: "white" }} />
          </Trans>
        </Text>
        <AssetSelectButton
          fullWidth
          onClick={onAsssetSelect}
          assetId={asset?.assetId ?? ""}
        />
      </SAssetSelectButtonBox>

      {!account && <Web3ConnectModalButton />}
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
          />
          {isAccountAllowed && asset && minDeposit > 0 && (
            <div
              sx={{ flex: "row", align: "center", justify: "space-between" }}
            >
              <Text fs={12} color="basic400">
                {t("deposit.cex.amount.min.title")}:
              </Text>
              <Text fs={12} color="brightBlue300">
                {t("value.tokenWithSymbol", {
                  value: minDeposit,
                  symbol: asset.data.asset.originSymbol,
                })}
              </Text>
            </div>
          )}
          {isAccountAllowed && (
            <>
              <div
                sx={{ flex: "row", align: "center", justify: "center", gap: 6 }}
              >
                <Spinner size={14} />
                <Text
                  fs={12}
                  lh={12}
                  font="GeistSemiBold"
                  tTransform="uppercase"
                >
                  {t("deposit.cex.awaiting.title")}
                </Text>
              </div>
              <Alert variant="info" sx={{ mt: 10 }}>
                {t("deposit.cex.asset.alert")}
              </Alert>
            </>
          )}
          <Separator
            color="darkBlue401"
            sx={{
              width: "auto",
              mx: "calc(var(--modal-content-padding) * -1)",
            }}
          />
        </>
      )}
      <CexDepositGuide cexId={cexId} />
    </div>
  )
}

function getAddressPrefix(chainKey: string) {
  const chain = chainsMap.get(chainKey)
  if (chain && isAnyParachain(chain)) {
    return chain.key === "assethub" ? 0 : chain.ss58Format
  }

  return 0
}
