import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { Alert, Button, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  isEthereumSigner,
  requestNetworkSwitch,
  useWallet,
} from "@galacticcouncil/web3-connect"
import { FC, useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { BankCashOutQuote } from "@/modules/onramp/bank/components/BankCashOutQuote"
import type { RampBuildResponse } from "@/modules/onramp/bank/config/schemas"

type BankCashOutReviewProps = {
  build: Omit<RampBuildResponse, "approveTx" | "redeemTx">
  currency: "usd" | "eur"
  hasApprove: boolean
  /** The chain the server prepared both transactions for. */
  chainId: number
  onSign: () => void
  onLeave: () => void
}

const CLOCK_MS = 5_000

/**
 * The binding quote of POST /v1/ramps, its validUntil and the steps the
 * wallet will be asked for. Sign is offered while the wallet is on the
 * prepared chain and validUntil has not passed; it is pressed once (the
 * caller drops the transactions when it hands them over).
 */
export const BankCashOutReview: FC<BankCashOutReviewProps> = ({
  build,
  currency,
  hasApprove,
  chainId,
  onSign,
  onLeave,
}) => {
  const { t } = useTranslation(["onramp"])
  const wallet = useWallet()
  const signer = isEthereumSigner(wallet?.signer) ? wallet.signer : null
  const [walletChain, setWalletChain] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const readChain = useCallback(async () => {
    if (!signer) return setWalletChain(null)
    try {
      const id: unknown = await signer.provider.request({
        method: "eth_chainId",
      })
      setWalletChain(typeof id === "string" ? Number(id) : null)
    } catch {
      setWalletChain(null)
    }
  }, [signer])

  useEffect(() => {
    void readChain()
  }, [readChain])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), CLOCK_MS)
    return () => clearInterval(timer)
  }, [])

  const expired = now >= Date.parse(build.validUntil)
  const onChain = walletChain === chainId
  const validUntil = new Date(build.validUntil)

  return (
    <Stack gap="m">
      <Text fs="p2" fw={500} font="primary">
        {t("bank.cashOut.review.title")}
      </Text>
      <BankCashOutQuote
        quote={build.quote}
        payoutLimit={build.payoutLimit}
        currency={currency}
      />
      <Text fs="p4" color={getToken("text.medium")}>
        {t("bank.cashOut.review.validUntil", { value: validUntil })}
      </Text>
      <Stack gap="xs">
        {hasApprove && (
          <Text fs="p4">{t("bank.cashOut.review.stepApprove")}</Text>
        )}
        <Text fs="p4">
          {t(
            hasApprove
              ? "bank.cashOut.review.stepRedeem"
              : "bank.cashOut.review.stepRedeemOnly",
          )}
        </Text>
      </Stack>
      <Alert variant="info" description={t("bank.cashOut.review.once")} />
      {expired && (
        <Alert variant="warning" description={t("bank.cashOut.review.expired")} />
      )}
      {!expired && signer && walletChain !== null && !onChain && (
        <>
          <Alert
            variant="warning"
            description={t("bank.cashOut.review.wrongNetwork")}
          />
          <Button
            variant="secondary"
            onClick={() =>
              void requestNetworkSwitch(signer.provider, {
                chain: HYDRATION_CHAIN_KEY,
              })
                .catch(() => undefined)
                .then(readChain)
            }
          >
            {t("bank.cashOut.review.switchNetwork")}
          </Button>
        </>
      )}
      <Button size="large" disabled={expired || !onChain} onClick={onSign}>
        {t("bank.cashOut.review.sign")}
      </Button>
      <Button variant="tertiary" onClick={onLeave}>
        {t("bank.cashOut.review.leave")}
      </Button>
    </Stack>
  )
}
