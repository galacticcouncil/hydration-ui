import { Button, Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { accountPublicKey } from "@galacticcouncil/utils"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { useDepositRecoveryStore } from "@/modules/onramp/deposit/store/useDepositRecoveryStore"

export const PortfolioRecoveryCards = ({ address }: { address: string }) => {
  const { t } = useTranslation("onramp")
  const deposits = useDepositRecoveryStore((state) => state.deposits)
  const key = accountPublicKey(address)
  return deposits
    .filter(
      (d) =>
        key &&
        [d.source.address, d.destinationAddress].some(
          (a) => accountPublicKey(a) === key,
        ),
    )
    .map((d) => {
      const setup = d.stage === "setup"
      const status = setup
        ? "setup"
        : d.stage === "pending"
          ? "pending"
          : d.error
            ? "failed"
            : !d.txHash
              ? "uncertain"
              : d.settled
                ? "completed"
                : "tracking"
      return (
        <Flex
          key={d.id}
          align="center"
          justify="space-between"
          gap="m"
          p="l"
          borderRadius="m"
          bg="surfaces.containers.dim.dimOnHigh"
          wrap
        >
          <Stack gap="xs">
            <Text fw={500}>{t(`deposit.recovery.${status}`)}</Text>
            <Text fs="p5" color="text.medium">
              {d.amount} {d.symbol} · {d.chainKey} → Hydration
            </Text>
          </Stack>
          {setup ? (
            <Button asChild size="small" variant="secondary">
              <Link
                to="/cross-chain"
                search={{
                  srcChain: d.chainKey,
                  srcAsset: d.assetKey,
                  destChain: "hydration",
                }}
              >
                {t("deposit.recovery.continue")}
              </Link>
            </Button>
          ) : (
            <Button asChild size="small" variant="secondary">
              <Link to="/cross-chain/history">
                {t("deposit.recovery.check")}
              </Link>
            </Button>
          )}
        </Flex>
      )
    })
}
