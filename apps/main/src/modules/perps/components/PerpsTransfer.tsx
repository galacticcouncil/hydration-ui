import { useUsdClassTransfer } from "@galacticcouncil/hyperliquid/hooks"
import {
  Button,
  Flex,
  Input,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { isEthereumSigner, useWallet } from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { HYPERLIQUID } from "@/config/hyperliquid"
import { PerpsStatRow } from "@/modules/perps/components/PerpsPanel"
import {
  usePerpsAccount,
  useSpotBalances,
} from "@/modules/perps/PerpsPage.data"

/** Rounding up a "max" transfer exceeds the balance and gets rejected. */
const floorUsd = (value: number) =>
  value > 0 ? String(Math.floor(value * 1e6) / 1e6) : "0"

type Props = {
  onDone: () => void
}

export const PerpsTransfer: FC<Props> = ({ onDone }) => {
  const { t } = useTranslation("trade")
  const wallet = useWallet()
  const [toPerp, setToPerp] = useState(true)
  const [amount, setAmount] = useState("")

  const { data: account } = usePerpsAccount()
  const { balances } = useSpotBalances()
  const transfer = useUsdClassTransfer({ isTestnet: HYPERLIQUID.isTestnet })

  const signer = wallet?.signer

  if (!isEthereumSigner(signer)) return null

  const spotUsdc = Number(
    balances.find((balance) => balance.coin === "USDC")?.total ?? 0,
  )
  // Account value includes margin locked in open positions, so only the
  // withdrawable portion can actually leave the perp balance.
  const perpsUsdc = Number(account?.withdrawable ?? 0)
  const available = toPerp ? spotUsdc : perpsUsdc

  const isOverBalance = Number(amount) > available
  const canSubmit = Number(amount) > 0 && !isOverBalance && !transfer.isPending

  return (
    <Stack gap="m">
      <Flex gap="xs">
        {[true, false].map((direction) => (
          <Button
            key={String(direction)}
            size="small"
            variant={direction === toPerp ? "secondary" : "muted"}
            onClick={() => setToPerp(direction)}
            sx={{ flex: 1, borderRadius: 4 }}
          >
            <Text fs="p6" font="mono">
              {t(direction ? "perps.transfer.toPerp" : "perps.transfer.toSpot")}
            </Text>
          </Button>
        ))}
      </Flex>

      <PerpsStatRow
        label={t("perps.transfer.available")}
        value={`${floorUsd(available)} USDC`}
      />

      <Flex gap="xs" align="center">
        <Input
          value={amount}
          placeholder="0.0"
          onChange={(e) => setAmount(e.target.value)}
          sx={{ flex: 1 }}
        />
        <Button
          size="small"
          variant="muted"
          disabled={!available}
          onClick={() => setAmount(floorUsd(available))}
          sx={{ borderRadius: 4 }}
        >
          {t("perps.transfer.max")}
        </Button>
      </Flex>

      {isOverBalance && (
        <Text fs="p6" color="red500">
          {t("perps.transfer.insufficient")}
        </Text>
      )}

      <Button
        variant="primary"
        disabled={!canSubmit}
        sx={{ borderRadius: 4 }}
        onClick={() =>
          transfer.mutate(
            {
              address: signer.address,
              provider: signer.provider,
              amount,
              toPerp,
            },
            {
              onSuccess: () => {
                setAmount("")
                onDone()
              },
            },
          )
        }
      >
        {transfer.isPending
          ? t("perps.transfer.pending")
          : t("perps.transfer.cta")}
      </Button>

      {transfer.isError && (
        <Text fs="p6" color="red500">
          {transfer.error.message}
        </Text>
      )}
    </Stack>
  )
}
