import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { AnyChain } from "@galacticcouncil/xcm-core"
import { EvmCall, WhTransfer } from "@galacticcouncil/xcm-sdk"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { useWormholeRedeem } from "sections/wallet/assets/wormhole/WalletWormholeRedeemTable.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { HYDRATION_CHAIN_KEY } from "utils/constants"

export type RedeemButtonProps = {
  transfer: WhTransfer
}

export const RedeemButton: React.FC<RedeemButtonProps> = ({ transfer }) => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const address = account?.address ?? ""

  const { redeem, toChain, assetSymbol: symbol, amount, operation } = transfer
  const call = address && redeem ? (redeem(address) as EvmCall) : undefined
  const chain =
    // incoming transfers are always redeemed on Moonbeam
    toChain.key === HYDRATION_CHAIN_KEY
      ? (chainsMap.get("moonbeam") as AnyChain)
      : toChain

  const { mutate, isLoading } = useWormholeRedeem(address)
  const onRedeem = call
    ? async () => mutate({ operation, call, chain, symbol, amount })
    : undefined

  return (
    <Button
      size="micro"
      disabled={!call || isLoading}
      isLoading={isLoading}
      onClick={onRedeem}
    >
      {t("redeem")}
    </Button>
  )
}
