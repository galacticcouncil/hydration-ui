import { Grid, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  useAccount,
  useWallet,
  useWeb3ConnectModal,
  WalletMode,
} from "@galacticcouncil/web3-connect"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { BankSetupTile } from "@/modules/onramp/bank/components/BankSetupTile"
import {
  MessageSigner,
  useHbrMe,
  useHbrOnboarding,
  useHbrOnrampAccounts,
  useHbrSession,
  useHbrSignIn,
} from "@/modules/onramp/bank/hooks/useHbr"
import type { BankEntry } from "@/modules/onramp/bank/store/useBankEntryStore"
import { isBankFlowEnabled } from "@/modules/onramp/bank/utils/bankAvailability"
import { BankTile, deriveBankTiles } from "@/modules/onramp/bank/utils/bankTile"
import {
  classifyBankError,
  deriveOnboardingStep,
} from "@/modules/onramp/bank/utils/onboarding"
import { classifySignError } from "@/modules/onramp/bank/utils/signing"
import { getBankWalletGate } from "@/modules/onramp/bank/utils/walletGate"

type BankPortfolioProps = {
  /** Opens a bank flow at the entry (navigation is the caller's). */
  onOpen: (entry: BankEntry) => void
  /** Phase B/C: the transfer history below the set-up tiles. */
  history?: (h160: string) => ReactNode
}

const entryOf = (tile: BankTile): BankEntry =>
  tile.account
    ? {
        direction: "deposit",
        target: { kind: "bankDetails", currency: tile.account.currency },
      }
    : { direction: "deposit" }

type SignedInProps = BankPortfolioProps & { h160: string }

const SignedIn: FC<SignedInProps> = ({ h160, onOpen, history }) => {
  const me = useHbrMe(h160)
  const onboarding = useHbrOnboarding(h160)
  const step =
    me.error && classifyBankError(me.error) === "support"
      ? ({ kind: "error", error: "support" } as const)
      : deriveOnboardingStep({
          data: onboarding.data,
          error: onboarding.error,
        })

  return (
    <>
      {step.kind === "ready" ? (
        <ReadyTiles h160={h160} onOpen={onOpen} />
      ) : (
        <TileList
          tiles={deriveBankTiles({
            walletOk: true,
            hasSession: true,
            step,
            onramp: undefined,
          })}
          onOpen={onOpen}
          onRetry={() => {
            void me.refetch()
            void onboarding.refetch()
          }}
        />
      )}
      {history?.(h160)}
    </>
  )
}

// The on-ramp accounts are read only once the set-up is done.
const ReadyTiles: FC<{
  h160: string
  onOpen: BankPortfolioProps["onOpen"]
}> = ({ h160, onOpen }) => {
  const onramp = useHbrOnrampAccounts(h160)
  return (
    <TileList
      tiles={deriveBankTiles({
        walletOk: true,
        hasSession: true,
        step: { kind: "ready", rails: { usd: true, eur: true } },
        onramp: onramp.data,
        onrampError: onramp.error,
      })}
      onOpen={onOpen}
      onRetry={() => void onramp.refetch()}
    />
  )
}

const TileList: FC<{
  tiles: BankTile[]
  onOpen: BankPortfolioProps["onOpen"]
  onRetry: () => void
}> = ({ tiles, onOpen, onRetry }) => (
  <Tiles>
    {tiles.map((tile) => (
      <BankSetupTile
        key={`${tile.kind}-${tile.account?.currency ?? ""}`}
        tile={tile}
        onAction={() =>
          tile.kind === "error" ? onRetry() : onOpen(entryOf(tile))
        }
      />
    ))}
  </Tiles>
)

const SignIn: FC<{ h160: string; signer: MessageSigner }> = ({
  h160,
  signer,
}) => {
  const { t } = useTranslation(["onramp"])
  const signIn = useHbrSignIn(h160, signer)
  return (
    <Tiles>
      <BankSetupTile
        tile={{ kind: "signIn", tone: "attention" }}
        busy={signIn.isPending}
        error={
          signIn.isError
            ? t(`bank.sign.error.${classifySignError(signIn.error)}`)
            : undefined
        }
        onAction={() => signIn.mutate()}
      />
    </Tiles>
  )
}

const Tiles: FC<{ children: ReactNode }> = ({ children }) => (
  <Grid columns={[1, null, 2]} gap="l">
    {children}
  </Grid>
)

const Session: FC<
  BankPortfolioProps & { h160: string; signer: MessageSigner }
> = ({ h160, signer, ...props }) => {
  const session = useHbrSession(h160)
  if (!session) return <SignIn h160={h160} signer={signer} />
  return <SignedIn h160={h160} {...props} />
}

/**
 * Portfolio, Deposits: the bank set-up tiles above the transfer history
 * (Figma M01-M08). Every tile is derived from the live reads of this wallet's
 * session; closing a bank flow keeps nothing but the server's own state.
 */
export const BankPortfolio: FC<BankPortfolioProps> = (props) => {
  const { t } = useTranslation(["onramp"])
  const { account } = useAccount()
  const wallet = useWallet()
  const { toggle } = useWeb3ConnectModal()
  const gate = getBankWalletGate(account, wallet?.signer)
  if (!isBankFlowEnabled()) return null

  return (
    <Stack gap="l">
      <Text
        as="h2"
        font="primary"
        fs="h7"
        fw={500}
        color={getToken("text.high")}
      >
        {t("bank.portfolio.setupTitle")}
      </Text>
      {gate.ok ? (
        <Session
          key={gate.h160}
          h160={gate.h160}
          signer={gate.signer}
          {...props}
        />
      ) : (
        <Tiles>
          <BankSetupTile
            tile={{ kind: "connect", tone: "attention" }}
            onAction={() => toggle(WalletMode.EVM)}
          />
        </Tiles>
      )}
    </Stack>
  )
}
