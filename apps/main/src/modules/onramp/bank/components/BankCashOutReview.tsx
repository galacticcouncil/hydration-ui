import { Alert, Button, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import {
  isEthereumSigner,
  requestNetworkSwitch,
  useWallet,
} from "@galacticcouncil/web3-connect"
import { FC, useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { BankCashOutQuote } from "@/modules/onramp/bank/components/BankCashOutQuote"
import { BankWithdrawalSummary } from "@/modules/onramp/bank/components/BankWithdrawalReceipt"
import type { RampBuildResponse } from "@/modules/onramp/bank/config/schemas"
import { formatUsdcBaseUnits } from "@/modules/onramp/bank/utils/onramp"

type BankCashOutReviewProps = {
  build: Omit<RampBuildResponse, "approveTx" | "redeemTx">
  currency: "usd" | "eur"
  accountLine: string | null
  hasApprove: boolean
  /** The chain the server prepared both transactions for. */
  chainId: number
  /**
   * The fixture service's demonstration (`service.mode === "fixture"`): the
   * review reads nothing from the wallet and its button only opens the status.
   */
  demo: boolean
  /** Sign (the hand-over), or in a demonstration the way on to the status. */
  onSign: () => void
  onLeave: () => void
}

const CLOCK_MS = 5_000

type ActionsProps = {
  chainId: number
  expired: boolean
  onSign: () => void
  onLeave: () => void
}

/**
 * The real review's actions: the wallet's chain, the network switch and Sign.
 * Sign is offered while the wallet is on the prepared chain and validUntil
 * has not passed. The only part of the review that reads the wallet.
 */
const SignActions: FC<ActionsProps> = ({
  chainId,
  expired,
  onSign,
  onLeave,
}) => {
  const { t } = useTranslation(["onramp"])
  const wallet = useWallet()
  const signer = isEthereumSigner(wallet?.signer) ? wallet.signer : null
  const [walletChain, setWalletChain] = useState<number | null>(null)

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

  const onChain = walletChain === chainId

  return (
    <>
      <Alert variant="info" description={t("bank.cashOut.review.once")} />
      {expired && (
        <Alert
          variant="warning"
          description={t("bank.cashOut.review.expired")}
        />
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
    </>
  )
}

/**
 * Invariant 1 of the fixture demonstration: these actions use no wallet hook,
 * so the demo review makes no signer or provider request and offers no
 * network switch. Invariant 4: the note says that nothing is signed or sent
 * and no money moves, and the button is not labelled as signing.
 */
const DemoActions: FC<Omit<ActionsProps, "chainId">> = ({
  expired,
  onSign,
  onLeave,
}) => {
  const { t } = useTranslation(["onramp"])
  return (
    <>
      <Alert variant="info" description={t("bank.cashOut.review.demoNote")} />
      {expired && (
        <Alert
          variant="warning"
          description={t("bank.cashOut.review.expired")}
        />
      )}
      <Button size="large" disabled={expired} onClick={onSign}>
        {t("bank.cashOut.review.demoContinue")}
      </Button>
      <Button variant="tertiary" onClick={onLeave}>
        {t("bank.cashOut.review.leave")}
      </Button>
    </>
  )
}

/**
 * The binding quote of POST /v1/ramps, its validUntil and the steps the
 * wallet will be asked for. Sign is pressed once (the caller drops the
 * transactions when it hands them over). In a demonstration the same layout
 * shows the demo actions instead of the wallet's.
 */
export const BankCashOutReview: FC<BankCashOutReviewProps> = ({
  build,
  currency,
  accountLine,
  hasApprove,
  chainId,
  demo,
  onSign,
  onLeave,
}) => {
  const { t } = useTranslation(["onramp"])
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), CLOCK_MS)
    return () => clearInterval(timer)
  }, [])

  const expired = now >= Date.parse(build.validUntil)
  const validUntil = new Date(build.validUntil)

  return (
    <Stack gap="m">
      <Text fs="p2" fw={500} font="primary">
        {t("bank.cashOut.review.title")}
      </Text>
      <BankWithdrawalSummary
        label={t("bank.cashOut.quote.bridgeCredited")}
        amount={t("bank.cashOut.quote.usdc", {
          amount: formatUsdcBaseUnits(build.quote.bridgeCredited) ?? "-",
        })}
        source={t("bank.cashOut.summary.from", {
          amount: formatUsdcBaseUnits(build.quote.usdcAmount) ?? "-",
        })}
        account={accountLine}
      />
      <BankCashOutQuote
        pricing={build}
        currency={currency}
        account={accountLine}
      />
      <Text fs="p4" color={getToken("text.medium")}>
        {t(
          demo
            ? "bank.cashOut.review.demoValidUntil"
            : "bank.cashOut.review.validUntil",
          { value: validUntil },
        )}
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
      {demo ? (
        <DemoActions expired={expired} onSign={onSign} onLeave={onLeave} />
      ) : (
        <SignActions
          chainId={chainId}
          expired={expired}
          onSign={onSign}
          onLeave={onLeave}
        />
      )}
    </Stack>
  )
}
