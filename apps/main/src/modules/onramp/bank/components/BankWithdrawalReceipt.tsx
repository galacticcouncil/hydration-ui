import { LandmarkIcon } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  Icon,
  ModalBody,
  Separator,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import type { ReactNode } from "react"

type BankWithdrawalSummaryProps = {
  label: string
  amount: ReactNode
  source?: string
  account?: string | null
}

type BankWithdrawalReceiptProps = BankWithdrawalSummaryProps & {
  notice?: ReactNode
  children: ReactNode
  statusId?: string
}

export function BankWithdrawalSummary({
  label,
  amount,
  source,
  account,
}: BankWithdrawalSummaryProps) {
  return (
    <Stack
      align="center"
      gap="base"
      p="l"
      sx={{
        borderRadius: "xl",
        bg: getToken("surfaces.containers.dim.dimOnHigh"),
        textAlign: "center",
      }}
    >
      <Text fs="p6" color={getToken("text.low")}>
        {label}
      </Text>
      <Flex align="center" gap="base">
        <Flex
          align="center"
          justify="center"
          width={30}
          height={30}
          borderRadius="full"
          borderWidth={1}
          borderStyle="solid"
          borderColor={getToken("details.borders")}
          sx={{ flexShrink: 0 }}
        >
          <Icon component={LandmarkIcon} size="s" />
        </Flex>
        <Text font="primary" fs="h6" fw={500} sx={{ overflowWrap: "anywhere" }}>
          {amount}
        </Text>
      </Flex>
      {source && (
        <Text fs="p6" color={getToken("text.medium")}>
          {source}
        </Text>
      )}
      {account && (
        <Text fs="p6" color={getToken("text.low")}>
          {account}
        </Text>
      )}
    </Stack>
  )
}

export function BankWithdrawalReceipt({
  label,
  amount,
  source,
  account,
  notice,
  children,
  statusId,
}: BankWithdrawalReceiptProps) {
  return (
    <ModalBody
      noPadding
      maxHeight={[
        "none",
        "max(8rem, calc(80dvh - var(--modal-top-content-height) - 15rem))",
      ]}
    >
      <div data-cash-out-status={statusId}>
        <Box p="var(--modal-content-padding)">
          <BankWithdrawalSummary {...{ label, amount, source, account }} />
        </Box>
        {notice && (
          <>
            <Separator />
            <Stack gap="base" p="var(--modal-content-padding)">
              {notice}
            </Stack>
          </>
        )}
        <Separator />
        <Stack gap="l" px="var(--modal-content-padding)" py="l">
          {children}
        </Stack>
      </div>
    </ModalBody>
  )
}
