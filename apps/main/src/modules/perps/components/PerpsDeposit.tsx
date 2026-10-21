import {
  ARBITRUM_USDC,
  depositToHyperliquid,
  getArbitrumUsdcBalance,
  MIN_DEPOSIT_USDC,
  USDC_DECIMALS,
} from "@galacticcouncil/hyperliquid/deposit"
import { hyperliquidQueryKeys } from "@galacticcouncil/hyperliquid/queries"
import {
  Alert,
  Button,
  Flex,
  Input,
  Paper,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { isEthereumSigner, useWallet } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { formatUnits } from "viem"

import { HYPERLIQUID } from "@/config/hyperliquid"

export const PerpsDeposit: FC = () => {
  const { t } = useTranslation("trade")
  const wallet = useWallet()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState("")

  const signer = wallet?.signer
  const address = isEthereumSigner(signer) ? signer.address : ""

  const { data: balance } = useQuery({
    queryKey: ["arbitrumUsdc", address],
    queryFn: () => getArbitrumUsdcBalance(address),
    enabled: !!address,
  })

  const available = balance ? formatUnits(balance, USDC_DECIMALS) : "0"

  const deposit = useMutation({
    mutationFn: () => {
      if (!isEthereumSigner(signer)) {
        throw new Error("An EVM account is required to deposit")
      }

      return depositToHyperliquid(signer.provider, signer.address, amount)
    },
    onSuccess: () => {
      setAmount("")
      queryClient.invalidateQueries({ queryKey: hyperliquidQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: ["arbitrumUsdc"] })
    },
  })

  const isBelowMinimum = !!amount && Number(amount) < MIN_DEPOSIT_USDC
  const canDeposit =
    !!amount && !isBelowMinimum && !deposit.isPending && !!address

  // Testnet uses a different bridge on Arbitrum Sepolia; refuse rather than
  // silently send mainnet funds.
  if (HYPERLIQUID.isTestnet) return null

  return (
    <Paper p="l">
      <Stack gap="m">
        <Text fs="p4" fw={600}>
          {t("perps.deposit.title")}
        </Text>

        <Flex justify="space-between">
          <Text fs="p6">{t("perps.deposit.available")}</Text>
          <Text fs="p6" fw={600}>{`${available} USDC`}</Text>
        </Flex>

        <Input
          value={amount}
          placeholder={String(MIN_DEPOSIT_USDC)}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Button
          size="small"
          variant="muted"
          onClick={() => setAmount(available)}
        >
          {t("perps.deposit.max")}
        </Button>

        {isBelowMinimum && (
          <Alert
            variant="warning"
            description={t("perps.deposit.minimum", {
              min: MIN_DEPOSIT_USDC,
            })}
          />
        )}

        <Text fs="p6">{t("perps.deposit.note")}</Text>

        <Button
          variant="primary"
          disabled={!canDeposit}
          onClick={() => deposit.mutate()}
        >
          {deposit.isPending
            ? t("perps.deposit.pending")
            : t("perps.deposit.cta")}
        </Button>

        {deposit.isError && (
          <Text fs="p6" color="red500">
            {deposit.error.message}
          </Text>
        )}

        <Text fs="p6">
          {t("perps.deposit.token", { token: ARBITRUM_USDC })}
        </Text>
      </Stack>
    </Paper>
  )
}
