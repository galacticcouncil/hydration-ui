import {
  Alert,
  Box,
  Flex,
  ModalBody,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"

import { FIXTURE_ADDRESS } from "@/modules/onramp/bank/config/fixtures"
import {
  DEPOSIT_TIMELINE,
  getDepositStage,
} from "@/modules/onramp/bank/utils/onramp"

import { BankTimeline } from "./BankTimeline"

const stages = DEPOSIT_TIMELINE.map(({ status, name }) =>
  status === "arrived" ? "Arrived on Base" : name,
)

export function BankDepositSampleReceipt({
  currency,
  amount,
  complete,
}: {
  currency: "usd" | "eur"
  amount: string
  complete: boolean
}) {
  const { gte } = useBreakpoints()
  const stage = getDepositStage(complete ? "credited" : "queued_on_hydration")
  const displayAmount = Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
  })
  return (
    <ModalBody
      noPadding
      maxHeight={
        gte("sm")
          ? "max(8rem, calc(80dvh - var(--modal-top-content-height) - 15rem))"
          : undefined
      }
    >
      <Box p="var(--modal-content-padding)">
        <Stack
          align="center"
          gap="base"
          p="l"
          sx={{
            borderRadius: "xl",
            bg: getToken("surfaces.containers.dim.dimOnHigh"),
          }}
        >
          <Text fs="p6" fw={500} color={getToken("text.low")}>
            {complete ? "You received" : "You receive"}
          </Text>
          <Flex align="center" gap="base">
            <img src="/images/bank-hollar.svg" width={30} height={30} alt="" />
            <Text font="primary" fs="h6" fw={500}>
              {displayAmount} HOLLAR
            </Text>
          </Flex>
          <Text fs="p6" color={getToken("text.medium")}>
            from {displayAmount} {currency.toUpperCase()} · Bank transfer
          </Text>
          <Text fs="p6" color={getToken("text.low")}>
            Wallet {FIXTURE_ADDRESS.slice(0, 6)}…{FIXTURE_ADDRESS.slice(-4)}
          </Text>
        </Stack>
      </Box>
      <Separator />
      <Box p="var(--modal-content-padding)">
        <Alert
          displayIcon={false}
          variant={complete ? "success" : "info"}
          description={
            complete
              ? "Your demo deposit has been credited."
              : "Your deposit is on its way. Do not send the transfer again."
          }
        />
      </Box>
      <Separator />
      <Box px="var(--modal-content-padding)" py="l">
        <BankTimeline
          key={complete ? "credited" : "queued"}
          stages={stages}
          lit={stage.lit}
          complete={complete}
          current={{
            label: stages[stage.lit - 1]!,
            detail: complete ? null : "HOLLAR is not credited yet.",
          }}
        />
      </Box>
    </ModalBody>
  )
}
